/**
 * Fase 1 da curadoria de "Tipos de Usos de Plantas" — cria os conceitos-pai novos.
 *
 * A API Admin (4001) não expõe rota de criação de conceito: cobre GET, PUT,
 * activate, deprecate, labels e relações, e nada mais. Este script usa a MESMA
 * fábrica de domínio que a aquisição usa (`createConcept` + `insertConcept`), de
 * dentro do container, e grava uma entrada de auditoria por conceito criado.
 * Toda operação posterior — rótulo, hierarquia, definição, ciclo de vida — passa
 * pela API, que é onde vivem os invariantes.
 *
 * Idempotente: usa o mesmo teste de existência do `upsertConcept` (pref + alt +
 * hidden), então uma segunda execução não duplica nada.
 *
 * Uso: docker exec BioCultDB node /data/fase1-criar-pais.mjs '<json com labels>'
 */

import database from '/app/bioculttermos/backend/src/shared/database.js';
import { createConcept, insertConcept } from '/app/bioculttermos/backend/src/models/Concept.js';
import { createAuditEntry, insertAuditEntry } from '/app/bioculttermos/backend/src/models/AuditEntry.js';

const FIELD = 'comunidades.plantas.tipoUso';
const RESPONSIBLE = process.env.ADMIN_USERNAME || 'etnotermos';

const labels = JSON.parse(process.argv[2]);
const db = database.connect();

const findByAnyLabel = db.prepare(
  `SELECT json_extract(doc,'$.id') AS id FROM etnotermos e
   WHERE EXISTS (SELECT 1 FROM json_each(coalesce(json_extract(e.doc,'$.prefLabels'),'[]')) je
                 WHERE json_extract(je.value,'$.literalForm') = :value)
      OR EXISTS (SELECT 1 FROM json_each(coalesce(json_extract(e.doc,'$.altLabels'),'[]')) je
                 WHERE json_extract(je.value,'$.literalForm') = :value)
      OR EXISTS (SELECT 1 FROM json_each(coalesce(json_extract(e.doc,'$.hiddenLabels'),'[]')) je
                 WHERE json_extract(je.value,'$.literalForm') = :value)`
);

const result = {};
for (const label of labels) {
  const existing = findByAnyLabel.get({ value: label });
  if (existing) {
    result[label] = { id: existing.id, action: 'existing' };
    continue;
  }

  const concept = createConcept({
    status: 'candidate',
    sourceFields: [FIELD],
    prefLabels: [{ literalForm: label, language: 'por', type: 'pref', accessLevel: 'public' }],
  });
  insertConcept(db, concept);
  insertAuditEntry(
    db,
    createAuditEntry({
      conceptId: concept.id,
      conceptLiteralForm: label,
      field: 'concept',
      previousValue: null,
      newValue: `criado como conceito-pai da taxonomia de ${FIELD} (curadoria, Fase 1)`,
      responsible: RESPONSIBLE,
    })
  );
  result[label] = { id: concept.id, action: 'created' };
}

process.stdout.write(JSON.stringify(result));
