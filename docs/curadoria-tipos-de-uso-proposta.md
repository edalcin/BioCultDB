# Proposta de curadoria — Campo Semântico "Tipos de Usos de Plantas"

> **Estado: PROPOSTA. Nada foi escrito na base de produção.**
> Gerada em 2026-08-06 a partir dos 713 conceitos cujo `sourceFields` contém
> `comunidades.plantas.tipoUso`, em `/data/biocultdb.sqlite` (produção, Unraid `Asilo`, 192.168.1.10).
> Backup prévio: `backup-pre-curadoria-tipouso-2026-08-06T17-45-03Z.sqlite` (`integrity_check: ok`, md5 `722f4aee…`).
> Critérios: `docs/Manual.md` (SKOS-XL, CARE). Procedimento e riscos: `docs/curadoria-tipos-de-uso-procedimento.md`.

## Resumo

| Métrica | Valor |
|---|---:|
| Termos de entrada | 713 |
| Conceitos mantidos, com posição na hierarquia | 297 |
| Conceitos-pai novos a criar | 31 |
| Termos absorvidos como rótulo alternativo | 362 |
| Termos absorvidos como rótulo oculto (grafia incorreta) | 9 |
| Termos apenas depreciados (compostos / sem conteúdo) | 44 |
| Termos intocados (pertencem a outro campo semântico) | 1 |
| **Conceitos sobreviventes** | **328** |
| Redução do vocabulário | **54%** |

## Árvore proposta

Dez facetas de 1º nível. Profundidade máxima 4. Sem ciclos (verificado).

```
- alimentar
  - chá
  - condimento
  - doce
- ambiental e ecológico
  - ambiental
  - fonte genética
  - manejo
  - ornamental
  - paisagístico
- comercial
- cosmético e higiene
  - cabelo
    - caspa
    - crescer cabelo
    - queda de cabelo
  - cosmético
  - dentadura
  - desinfetante
  - higiene
  - mau hálito
  - pigmentação
- indeterminado
- material e tecnológico
  - arame
  - artesanato
  - balanço
  - caça
  - cesto
  - chaqueiro
  - combustível
  - construção
    - caibro
    - canal
    - cerne
    - revestimento
  - corante
  - fio
  - lubrificante
  - madeira
  - móveis
  - pesca
  - ponta de flecha
  - porrete
  - quengo
  - químico
  - ralação
  - tecnologia
  - utensílio
  - velas
- medicinal
  - ação farmacológica
    - abortivo
    - analgésico
    - anti-inflamatório
    - antibiótico
    - anticâncer
    - antidepressivo
    - antidiabético
    - antiespasmódico
    - antigripal
    - antisséptico
    - antitérmico
    - antiviral
    - calmante
    - causar vômito
    - cicatrizante
    - contraceptivo
    - depurativo
    - diaforético
    - digestivo
    - diurético
    - emagrecedor
    - esfolantes
    - estimulante
    - expectorante
    - fisioterápico
    - fortificante
    - laxante
    - purgante
    - reconstituinte
    - refrescante
    - relaxante
    - remédio
    - sedativo
    - tonificante
    - vermífugo
  - forma de preparo e administração
    - emplastro
    - gargarejos para inflamação na garganta
    - xarope
  - indicação terapêutica
    - alergias e problemas imunológicos
      - alergia
      - anticorpos
    - condições gerais e inespecíficas
      - arrepiamento
      - cansaço
      - fraqueza
      - frio
      - suor
    - doenças de pele
      - calos
      - cobreiro
      - coceira
      - eczemas
      - erupção cutânea
      - espinha
      - frieira
      - furúnculo
      - herpes
      - impingem
      - infecção de pele
      - mancha na pele
      - micoses
      - postema
      - psoríase
      - ressecamento
      - urticária
      - verrugas
    - doenças infecciosas e parasitárias
      - ameba
      - cancro
      - chagas
      - dengue
      - doença venérea
      - escorbuto
      - infecção
      - malária
      - parasitas
      - sarampo
      - sarna
      - tifo
      - verme
      - virose
    - dor
      - cólica
        - cólica de bebê
        - cólica de útero
        - cólica menstrual
        - cólica renal
        - cólicas do fígado
      - dor de barriga
      - dor de cabeça
      - dor de dente
      - dor de garganta
      - dor de ouvido
      - dor na bacia
      - dor nas articulações
      - dor nas costas
      - dor nas pernas
      - dor no corpo
      - dor no estômago
      - dor no fígado
      - dor no intestino
      - dor no peito
      - dor no pulmão
      - dor nos ossos
      - dor nos rins
      - dores musculares
      - enxaqueca
      - espinhela caída
      - nevralgia
      - pontada
    - envenenamentos e picadas
      - intoxicação
      - picada de cobra
      - picada de insetos
    - febre
    - inflamação
      - inflamação do estômago
      - inflamação do útero
      - inflamação intestinal
      - inflamação na bexiga
      - inflamação na garganta
      - inflamação no fígado
      - inflamação nos dentes
      - inflamação ovariana
    - neoplasias
      - câncer
      - linfoma
      - tumor
    - problemas cardiovasculares
      - problemas circulatórios
        - derrame
        - hemorragia
        - hemorroidas
        - pressão alta
        - pressão baixa
        - varizes
      - problemas do coração
        - cardiorritmo
        - palpitação do coração
        - taquicardia
    - problemas dermatológicos
    - problemas digestivos
      - apetite
      - azia
      - boca ferida
      - cólicas intestinais
      - diarreia
      - enjoo
      - flatulência
      - gases
      - gastrite
      - infecção intestinal
      - mucosite oral
      - má digestão
      - náusea
      - prisão de ventre
      - sapinho
      - soluço
      - vômito
      - úlcera
    - problemas do aparelho reprodutor masculino
      - diminuir libido masculina
      - impotência
      - próstata
    - problemas do fígado
      - cirrose
      - gordura no fígado
      - hepatite
      - icterícia
      - intoxicação do fígado
      - pedra na vesícula
      - vesícula
    - problemas ginecológicos e obstétricos
      - corrimento
      - infecção de ovário
      - infertilidade
      - menopausa
      - menstruação
      - mioma
      - parto
      - seio
      - útero
    - problemas hematológicos
      - anemia
      - sangue
    - problemas hepáticos e biliares
    - problemas metabólicos e endócrinos
      - bócio
      - colesterol
      - diabetes
      - triglicerídeos
    - problemas neurológicos e psíquicos
      - depressão
      - epilepsia
      - esquecimento
      - estresse
      - insônia
      - labirintite
      - mal de parkinson
      - nervosismo
      - paralisia
      - tontura
    - problemas odontológicos
      - dente
      - gengiva
      - queixo
    - problemas oftálmicos
      - conjuntivite
      - olho
    - problemas osteomusculares
      - artrite
      - coluna
      - contusão
      - fraturas
      - gota
      - luxação
      - ossos
      - raquitismo
      - reumatismo
    - problemas otorrinolaringológicos
      - caxumba
      - garganta
      - ouvido
    - problemas renais
      - ardor ao urinar
      - bexiga
      - incontinência urinária
      - infecção renal
      - infecção urinária
      - pedra nos rins
      - retenção de líquidos
      - urina trancada
    - problemas renais e urinários
    - problemas respiratórios
      - asma
      - bronquite
      - catarro
      - congestão
      - coqueluche
      - falta de ar
      - fôlego
      - gripe
      - pneumonia
      - resfriado
      - rouquidão
      - sinusite
      - tosse
      - tuberculose
    - traumatismos e ferimentos
      - cortes
      - ferida
      - ferimento
      - queimadura
      - sangramento
      - traumatismo
- ritual e espiritual
  - banho
  - contra feitiçaria
  - defumação
  - descarrego
  - espectro
  - espiritual
  - litúrgico
  - lúdico
  - mágico
  - místico
  - olho gordo
  - ritual
- tóxico e defensivo
  - inseticida
  - tóxico
  - veneno
- veterinário e forrageiro
  - forragem
```

## Legenda das operações

| Operação | Significado | Efeito no banco |
|---|---|---|
| `manter` | O termo vira conceito próprio sob o pai indicado. | `POST /concepts/:id/broader` |
| `→ rótulo alt` | Variante válida (plural, sinônimo, tradução, variante de regência). | `POST /concepts/:alvo/labels` (type=alt) + `POST /concepts/:origem/deprecate` apontando o alvo |
| `→ rótulo oculto` | Grafia incorreta; invisível ao público, mas encontrável na busca. | idem, com `type=hidden` |
| `depreciar →` | Termo composto ou sem conteúdo informativo; não vira rótulo. | `POST /concepts/:id/deprecate` |
| `não tocar` | O termo pertence de fato a outro campo semântico. | nenhum |

> **Por que o conceito de origem é depreciado em vez de apagado:** a aquisição noturna
> (`AcquisitionService.upsertConcept`) procura o termo apenas entre os `prefLabels`. Um conceito apagado
> — ou que perdeu seu `prefLabel` — é recriado na madrugada seguinte. Depreciar preserva o `prefLabel`,
> e a curadoria sobrevive. Ver §Riscos do procedimento.

## Decisão termo a termo

| # | Termo | Operação | Destino / Pai |
|---:|---|---|---|
| 1 | `abortivo` | manter | `ação farmacológica` |
| 2 | `aborto` | → rótulo alt | `abortivo` |
| 3 | `abre o apetite` | → rótulo alt | `apetite` |
| 4 | `abrir o apetite` | → rótulo alt | `apetite` |
| 5 | `acalmar` | → rótulo alt | `calmante` |
| 6 | `acidez no estômago` | → rótulo alt | `azia` |
| 7 | `afinar o sangue` | → rótulo alt | `depurativo` |
| 8 | `alergia` | manter | `alergias e problemas imunológicos` |
| 9 | `alergias` | → rótulo alt | `alergia` |
| 10 | `alimentar` | manter | *(faceta raiz)* |
| 11 | `alimentação` | → rótulo alt | `alimentar` |
| 12 | `alimentação (palmito)` | depreciar → | `alimentar` |
| 13 | `alimentação (vinho dos frutos)` | depreciar → | `alimentar` |
| 14 | `alimentação animal` | → rótulo alt | `forragem` |
| 15 | `alimentação humana` | → rótulo alt | `alimentar` |
| 16 | `alimento` | → rótulo alt | `alimentar` |
| 17 | `alimentício` | → rótulo alt | `alimentar` |
| 18 | `aliviar insônia` | → rótulo alt | `insônia` |
| 19 | `aliviar tosses` | → rótulo alt | `tosse` |
| 20 | `ambiental` | manter | `ambiental e ecológico` |
| 21 | `ameba` | manter | `doenças infecciosas e parasitárias` |
| 22 | `analgésico` | manter | `ação farmacológica` |
| 23 | `anemia` | manter | `problemas hematológicos` |
| 24 | `anti-inflamatório` | manter | `ação farmacológica` |
| 25 | `anti-inflamatório geral` | → rótulo alt | `anti-inflamatório` |
| 26 | `anti-inflammatory` | → rótulo alt | `anti-inflamatório` |
| 27 | `antibiótico` | manter | `ação farmacológica` |
| 28 | `anticorpos` | manter | `alergias e problemas imunológicos` |
| 29 | `anticâncer` | manter | `ação farmacológica` |
| 30 | `antidepressivo` | manter | `ação farmacológica` |
| 31 | `antidiabético` | manter | `ação farmacológica` |
| 32 | `antiespasmódico` | manter | `ação farmacológica` |
| 33 | `antigripal` | manter | `ação farmacológica` |
| 34 | `antiinflamatório` | → rótulo alt | `anti-inflamatório` |
| 35 | `antisséptico` | manter | `ação farmacológica` |
| 36 | `antitérmico` | manter | `ação farmacológica` |
| 37 | `antiviral` | manter | `ação farmacológica` |
| 38 | `apertar os dentes` | → rótulo alt | `dente` |
| 39 | `apetite` | manter | `problemas digestivos` |
| 40 | `arame` | manter | `material e tecnológico` |
| 41 | `ardor ao urinar` | manter | `problemas renais` |
| 42 | `ardor no estômago` | → rótulo alt | `azia` |
| 43 | `arranhões` | → rótulo alt | `cortes` |
| 44 | `arrepiamento` | manter | `condições gerais e inespecíficas` |
| 45 | `artesanal` | → rótulo alt | `artesanato` |
| 46 | `artesanal (confecção de artesanato com sementes)` | depreciar → | `artesanato` |
| 47 | `artesanato` | manter | `material e tecnológico` |
| 48 | `artrite` | manter | `problemas osteomusculares` |
| 49 | `as depressant` | → rótulo alt | `sedativo` |
| 50 | `asma` | manter | `problemas respiratórios` |
| 51 | `asma brônquica` | → rótulo alt | `asma` |
| 52 | `asma e tosse` | depreciar → | `gripe` |
| 53 | `aumentar o leite quando estiver amamentando` | → rótulo alt | `parto` |
| 54 | `ausência da menstruação` | → rótulo alt | `menstruação` |
| 55 | `azia` | manter | `problemas digestivos` |
| 56 | `backache` | → rótulo alt | `dor nas costas` |
| 57 | `baixa a pressão` | → rótulo alt | `pressão alta` |
| 58 | `baixar a febre` | → rótulo alt | `febre` |
| 59 | `baixar a pressão` | → rótulo alt | `pressão alta` |
| 60 | `baixar o colesterol` | → rótulo alt | `colesterol` |
| 61 | `baixar os triglicerídeos` | → rótulo alt | `triglicerídeos` |
| 62 | `baixo astral` | → rótulo alt | `depressão` |
| 63 | `balanço` | manter | `material e tecnológico` |
| 64 | `banho` | manter | `ritual e espiritual` |
| 65 | `banho de assento` | → rótulo alt | `banho` |
| 66 | `bath seat` | → rótulo alt | `banho` |
| 67 | `batidas` | → rótulo alt | `palpitação do coração` |
| 68 | `bexiga` | manter | `problemas renais` |
| 69 | `bicho de pé` | → rótulo alt | `parasitas` |
| 70 | `boca ferida` | manter | `problemas digestivos` |
| 71 | `broken bone` | → rótulo alt | `fraturas` |
| 72 | `bronquite` | manter | `problemas respiratórios` |
| 73 | `bronquite asmática` | → rótulo alt | `bronquite` |
| 74 | `bronquites` | → rótulo alt | `bronquite` |
| 75 | `bócio` | manter | `problemas metabólicos e endócrinos` |
| 76 | `cabelo` | manter | `cosmético e higiene` |
| 77 | `caibro` | manter | `construção` |
| 78 | `calmante` | manter | `ação farmacológica` |
| 79 | `calmante (nervoso)` | depreciar → | `calmante` |
| 80 | `calmante infantil` | depreciar → | `calmante` |
| 81 | `calmante natural` | → rótulo alt | `calmante` |
| 82 | `calmante para o coração` | depreciar → | `calmante` |
| 83 | `calmante para os nervos` | depreciar → | `calmante` |
| 84 | `calos` | manter | `doenças de pele` |
| 85 | `canal` | manter | `construção` |
| 86 | `cancer` | → rótulo alt | `câncer` |
| 87 | `cancro` | manter | `doenças infecciosas e parasitárias` |
| 88 | `cansado` | → rótulo alt | `cansaço` |
| 89 | `cansaço` | manter | `condições gerais e inespecíficas` |
| 90 | `cardiorritmo` | manter | `problemas do coração` |
| 91 | `caroço no útero` | → rótulo alt | `útero` |
| 92 | `caspa` | manter | `cabelo` |
| 93 | `catarro` | manter | `problemas respiratórios` |
| 94 | `catarro no peito` | → rótulo alt | `catarro` |
| 95 | `catarro pulmonar` | → rótulo alt | `catarro` |
| 96 | `catuaba` | depreciar → | `indeterminado` |
| 97 | `causar vômito` | manter | `ação farmacológica` |
| 98 | `caxumba` | manter | `problemas otorrinolaringológicos` |
| 99 | `caça` | manter | `material e tecnológico` |
| 100 | `cerne` | manter | `construção` |
| 101 | `cesto` | manter | `material e tecnológico` |
| 102 | `chagas` | manter | `doenças infecciosas e parasitárias` |
| 103 | `chaqueiro` | manter | `material e tecnológico` |
| 104 | `chá` | manter | `alimentar` |
| 105 | `chá (bebida recreativa)` | → rótulo alt | `chá` |
| 106 | `chá de bebê` | depreciar → | `alimentar` |
| 107 | `cicatrizante` | manter | `ação farmacológica` |
| 108 | `cicatrizar` | → rótulo alt | `cicatrizante` |
| 109 | `cicatrizar feridas` | → rótulo alt | `cicatrizante` |
| 110 | `cicatrizar feridas e úlceras` | → rótulo alt | `cicatrizante` |
| 111 | `cicatrização` | → rótulo alt | `cicatrizante` |
| 112 | `cicatrização de feridas` | → rótulo alt | `cicatrizante` |
| 113 | `cicatrizing and muscular relaxant` | → rótulo alt | `cicatrizante` |
| 114 | `circulação` | → rótulo alt | `problemas circulatórios` |
| 115 | `circulação do sangue` | → rótulo alt | `problemas circulatórios` |
| 116 | `cirrose` | manter | `problemas do fígado` |
| 117 | `clister` | → rótulo alt | `purgante` |
| 118 | `cobertura (folhas para coberturas temporárias, barracos, capovas, galinheiros, canteiros, viveiros)` | depreciar → | `construção` |
| 119 | `cobreiro` | manter | `doenças de pele` |
| 120 | `coceira` | manter | `doenças de pele` |
| 121 | `coceiras` | → rótulo alt | `coceira` |
| 122 | `colesterol` | manter | `problemas metabólicos e endócrinos` |
| 123 | `colesterol alto` | → rótulo alt | `colesterol` |
| 124 | `colesterol e diabetes` | depreciar → | `diabetes` |
| 125 | `coluna` | manter | `problemas osteomusculares` |
| 126 | `combate o reumatismo` | → rótulo alt | `reumatismo` |
| 127 | `combustível` | manter | `material e tecnológico` |
| 128 | `comercial (venda do palmito)` | depreciar → | `comercial` |
| 129 | `comida` | → rótulo alt | `alimentar` |
| 130 | `comércio` | → rótulo alt | `comercial` |
| 131 | `condimento` | manter | `alimentar` |
| 132 | `congestão` | manter | `problemas respiratórios` |
| 133 | `conjuntivite` | manter | `problemas oftálmicos` |
| 134 | `constipação` | → rótulo alt | `prisão de ventre` |
| 135 | `construção` | manter | `material e tecnológico` |
| 136 | `construção (caibros e ripas com estipe)` | depreciar → | `construção` |
| 137 | `construção (esteios com estipe)` | depreciar → | `construção` |
| 138 | `contra feitiçaria` | manter | `ritual e espiritual` |
| 139 | `contra queda de cabelo` | → rótulo alt | `queda de cabelo` |
| 140 | `contraceptivo` | manter | `ação farmacológica` |
| 141 | `controlar a pressão arterial` | → rótulo alt | `pressão alta` |
| 142 | `controls the period` | → rótulo alt | `menstruação` |
| 143 | `contusão` | manter | `problemas osteomusculares` |
| 144 | `contusões` | → rótulo alt | `contusão` |
| 145 | `coqueluche` | manter | `problemas respiratórios` |
| 146 | `corante` | manter | `material e tecnológico` |
| 147 | `coração` | → rótulo alt | `problemas do coração` |
| 148 | `corpo` | depreciar → | `indeterminado` |
| 149 | `corpo ruim` | → rótulo alt | `fraqueza` |
| 150 | `corrimento` | manter | `problemas ginecológicos e obstétricos` |
| 151 | `cortar veneno de cobra` | → rótulo alt | `picada de cobra` |
| 152 | `cortes` | manter | `traumatismos e ferimentos` |
| 153 | `cosmético` | manter | `cosmético e higiene` |
| 154 | `cough` | → rótulo alt | `tosse` |
| 155 | `cozinha` | depreciar → | `alimentar` |
| 156 | `cramps` | → rótulo alt | `cólica` |
| 157 | `crescer cabelo` | manter | `cabelo` |
| 158 | `crises nervosas` | → rótulo alt | `nervosismo` |
| 159 | `cuidados pessoais` | → rótulo alt | `higiene` |
| 160 | `cura` | → rótulo alt | `remédio` |
| 161 | `cura de furúnculos` | → rótulo alt | `furúnculo` |
| 162 | `curar a asma` | → rótulo alt | `asma` |
| 163 | `curar insônia` | → rótulo alt | `insônia` |
| 164 | `cálculo renal` | → rótulo alt | `pedra nos rins` |
| 165 | `câncer` | manter | `neoplasias` |
| 166 | `câncer de próstata` | → rótulo alt | `câncer` |
| 167 | `cólica` | manter | `dor` |
| 168 | `cólica de bebê` | manter | `cólica` |
| 169 | `cólica de rins` | → rótulo alt | `cólica renal` |
| 170 | `cólica de útero` | manter | `cólica` |
| 171 | `cólica menstrual` | manter | `cólica` |
| 172 | `cólica provocada por vermes` | → rótulo alt | `verme` |
| 173 | `cólica renal` | manter | `cólica` |
| 174 | `cólica uterina` | → rótulo alt | `cólica de útero` |
| 175 | `cólicas` | → rótulo alt | `cólica` |
| 176 | `cólicas do fígado` | manter | `cólica` |
| 177 | `cólicas do fígado e estômago` | → rótulo alt | `cólicas do fígado` |
| 178 | `cólicas e dores` | → rótulo alt | `cólica` |
| 179 | `cólicas intestinais` | manter | `problemas digestivos` |
| 180 | `cólicas menstruais` | → rótulo alt | `cólica menstrual` |
| 181 | `dar energia` | → rótulo alt | `tonificante` |
| 182 | `dar sono` | → rótulo alt | `insônia` |
| 183 | `defumador` | → rótulo alt | `defumação` |
| 184 | `defumação` | manter | `ritual e espiritual` |
| 185 | `dengue` | manter | `doenças infecciosas e parasitárias` |
| 186 | `dentadura` | manter | `cosmético e higiene` |
| 187 | `dente` | manter | `problemas odontológicos` |
| 188 | `dentição` | → rótulo alt | `dente` |
| 189 | `depressant` | → rótulo alt | `sedativo` |
| 190 | `depression` | → rótulo alt | `depressão` |
| 191 | `depressão` | manter | `problemas neurológicos e psíquicos` |
| 192 | `depurativo` | manter | `ação farmacológica` |
| 193 | `depurativo do sangue` | → rótulo alt | `depurativo` |
| 194 | `derrame` | manter | `problemas circulatórios` |
| 195 | `derrames` | → rótulo alt | `derrame` |
| 196 | `descarrego` | manter | `ritual e espiritual` |
| 197 | `desinfetante` | manter | `cosmético e higiene` |
| 198 | `desintoxicar` | → rótulo alt | `depurativo` |
| 199 | `desintoxicação alimentar` | → rótulo alt | `intoxicação` |
| 200 | `desânimo` | → rótulo alt | `depressão` |
| 201 | `diabete` | → rótulo alt | `diabetes` |
| 202 | `diabetes` | manter | `problemas metabólicos e endócrinos` |
| 203 | `diaforético` | manter | `ação farmacológica` |
| 204 | `diarreia` | manter | `problemas digestivos` |
| 205 | `diarréia` | → rótulo oculto | `diarreia` |
| 206 | `digestivo` | manter | `ação farmacológica` |
| 207 | `digestão` | → rótulo alt | `problemas digestivos` |
| 208 | `diminuir calores da menopausa` | → rótulo alt | `menopausa` |
| 209 | `diminuir libido masculina` | manter | `problemas do aparelho reprodutor masculino` |
| 210 | `disenteria` | → rótulo alt | `diarreia` |
| 211 | `disfunção erétil` | → rótulo alt | `impotência` |
| 212 | `dispepsia` | → rótulo alt | `má digestão` |
| 213 | `distúrbio intestinal` | → rótulo alt | `problemas digestivos` |
| 214 | `diurético` | manter | `ação farmacológica` |
| 215 | `doce` | manter | `alimentar` |
| 216 | `doença do coração` | → rótulo alt | `problemas do coração` |
| 217 | `doença venérea` | manter | `doenças infecciosas e parasitárias` |
| 218 | `doenças` | depreciar → | `indeterminado` |
| 219 | `doenças como o câncer` | → rótulo alt | `câncer` |
| 220 | `doenças da pele` | → rótulo alt | `doenças de pele` |
| 221 | `doenças de pele` | manter | `indicação terapêutica` |
| 222 | `doenças dos olhos` | → rótulo alt | `olho` |
| 223 | `doenças respiratórias` | → rótulo alt | `problemas respiratórios` |
| 224 | `doenças venéreas` | → rótulo alt | `doença venérea` |
| 225 | `dor` | manter | `indicação terapêutica` |
| 226 | `dor abdominal` | → rótulo alt | `dor de barriga` |
| 227 | `dor corporal` | → rótulo alt | `dor no corpo` |
| 228 | `dor de barriga` | manter | `dor` |
| 229 | `dor de cabeça` | manter | `dor` |
| 230 | `dor de dente` | manter | `dor` |
| 231 | `dor de dente (antiinflamatório)` | → rótulo alt | `dor de dente` |
| 232 | `dor de dente e cabeça` | depreciar → | `dor de dente` |
| 233 | `dor de estomago` | → rótulo oculto | `dor no estômago` |
| 234 | `dor de estômago` | → rótulo alt | `dor no estômago` |
| 235 | `dor de garganta` | manter | `dor` |
| 236 | `dor de ouvido` | manter | `dor` |
| 237 | `dor de rins` | → rótulo alt | `dor nos rins` |
| 238 | `dor do peito` | → rótulo alt | `dor no peito` |
| 239 | `dor e inflamação` | depreciar → | `inflamação` |
| 240 | `dor lombar` | → rótulo alt | `dor nas costas` |
| 241 | `dor na bacia` | manter | `dor` |
| 242 | `dor na barriga` | → rótulo alt | `dor de barriga` |
| 243 | `dor na coluna` | → rótulo alt | `dor nas costas` |
| 244 | `dor na espinha` | → rótulo alt | `dor nas costas` |
| 245 | `dor nas articulações` | manter | `dor` |
| 246 | `dor nas costas` | manter | `dor` |
| 247 | `dor nas juntas` | → rótulo alt | `dor nas articulações` |
| 248 | `dor nas pernas` | manter | `dor` |
| 249 | `dor no corpo` | manter | `dor` |
| 250 | `dor no estomago` | → rótulo oculto | `dor no estômago` |
| 251 | `dor no estômago` | manter | `dor` |
| 252 | `dor no fígado` | manter | `dor` |
| 253 | `dor no intestino` | manter | `dor` |
| 254 | `dor no peito` | manter | `dor` |
| 255 | `dor no pulmão` | manter | `dor` |
| 256 | `dor nos ossos` | manter | `dor` |
| 257 | `dor nos rins` | manter | `dor` |
| 258 | `dor para enxaqueca` | → rótulo alt | `enxaqueca` |
| 259 | `dores` | → rótulo alt | `dor no corpo` |
| 260 | `dores de cabeça` | → rótulo alt | `dor de cabeça` |
| 261 | `dores de estômago` | → rótulo alt | `dor no estômago` |
| 262 | `dores e cólicas` | → rótulo alt | `cólica` |
| 263 | `dores em geral` | → rótulo alt | `dor` |
| 264 | `dores estomacais` | → rótulo alt | `dor no estômago` |
| 265 | `dores musculares` | manter | `dor` |
| 266 | `dores na bexiga` | → rótulo alt | `bexiga` |
| 267 | `dores nas articulações` | → rótulo alt | `dor nas articulações` |
| 268 | `dores no corpo` | → rótulo alt | `dor no corpo` |
| 269 | `dores no estômago` | → rótulo alt | `dor no estômago` |
| 270 | `dores no estômago e fígado` | → rótulo alt | `dor no fígado` |
| 271 | `dores no geral` | → rótulo alt | `dor` |
| 272 | `dores no peito` | → rótulo alt | `dor no peito` |
| 273 | `dores no útero` | → rótulo alt | `útero` |
| 274 | `dormir` | → rótulo alt | `insônia` |
| 275 | `dúvida` | depreciar → | `indeterminado` |
| 276 | `ease the heat from the menopause` | → rótulo alt | `menopausa` |
| 277 | `ecológico (atração de animais para caça)` | → rótulo alt | `ambiental` |
| 278 | `eczemas` | manter | `doenças de pele` |
| 279 | `edema` | → rótulo alt | `retenção de líquidos` |
| 280 | `elimina o colesterol ruim` | → rótulo alt | `colesterol` |
| 281 | `emagrecedor` | manter | `ação farmacológica` |
| 282 | `emagrecer` | → rótulo alt | `emagrecedor` |
| 283 | `emagrecimento` | → rótulo alt | `emagrecedor` |
| 284 | `emplastro` | manter | `forma de preparo e administração` |
| 285 | `energia` | → rótulo alt | `tonificante` |
| 286 | `enferrujado` | depreciar → | `indeterminado` |
| 287 | `enjoo` | manter | `problemas digestivos` |
| 288 | `entorses` | → rótulo alt | `luxação` |
| 289 | `envenenamento` | → rótulo alt | `intoxicação` |
| 290 | `enxaqueca` | manter | `dor` |
| 291 | `epilepsia` | manter | `problemas neurológicos e psíquicos` |
| 292 | `equimoses` | → rótulo alt | `contusão` |
| 293 | `erupção cutânea` | manter | `doenças de pele` |
| 294 | `escorbuto` | manter | `doenças infecciosas e parasitárias` |
| 295 | `escoriações` | → rótulo alt | `cortes` |
| 296 | `escorregadio` | → rótulo alt | `lubrificante` |
| 297 | `esfolantes` | manter | `ação farmacológica` |
| 298 | `esgotamento` | → rótulo alt | `cansaço` |
| 299 | `esgotamento físico` | → rótulo alt | `cansaço` |
| 300 | `espectro` | manter | `ritual e espiritual` |
| 301 | `espinha` | manter | `doenças de pele` |
| 302 | `espinhela caída` | manter | `dor` |
| 303 | `espiritual` | manter | `ritual e espiritual` |
| 304 | `esquecimento` | manter | `problemas neurológicos e psíquicos` |
| 305 | `estimulante` | manter | `ação farmacológica` |
| 306 | `estimulante sexual` | → rótulo alt | `estimulante` |
| 307 | `estresse` | manter | `problemas neurológicos e psíquicos` |
| 308 | `estômago` | → rótulo alt | `problemas digestivos` |
| 309 | `estômago e fígado` | depreciar → | `problemas do fígado` |
| 310 | `excitante` | → rótulo alt | `estimulante` |
| 311 | `expectorante` | manter | `ação farmacológica` |
| 312 | `fadiga` | → rótulo alt | `cansaço` |
| 313 | `falta de apetite` | → rótulo alt | `apetite` |
| 314 | `falta de ar` | manter | `problemas respiratórios` |
| 315 | `falta de memória` | → rótulo alt | `esquecimento` |
| 316 | `falta de menstruação` | → rótulo alt | `menstruação` |
| 317 | `fazer a digestão` | → rótulo alt | `má digestão` |
| 318 | `febre` | manter | `indicação terapêutica` |
| 319 | `febres` | → rótulo alt | `febre` |
| 320 | `ferida` | manter | `traumatismos e ferimentos` |
| 321 | `feridas` | → rótulo alt | `ferida` |
| 322 | `ferimento` | manter | `traumatismos e ferimentos` |
| 323 | `ferimentos` | → rótulo alt | `ferimento` |
| 324 | `fever` | → rótulo alt | `febre` |
| 325 | `fio` | manter | `material e tecnológico` |
| 326 | `fisioterápico` | manter | `ação farmacológica` |
| 327 | `flatulência` | manter | `problemas digestivos` |
| 328 | `flu` | → rótulo alt | `gripe` |
| 329 | `fome` | → rótulo alt | `alimentar` |
| 330 | `fonte genética` | manter | `ambiental e ecológico` |
| 331 | `forragem` | manter | `veterinário e forrageiro` |
| 332 | `forragem (folhas para burros e cavalos)` | → rótulo alt | `forragem` |
| 333 | `fortalecer os ossos` | → rótulo alt | `ossos` |
| 334 | `fortificante` | manter | `ação farmacológica` |
| 335 | `fortificar a memória` | → rótulo alt | `esquecimento` |
| 336 | `fraqueza` | manter | `condições gerais e inespecíficas` |
| 337 | `fraqueza em geral` | → rótulo alt | `fraqueza` |
| 338 | `fraturas` | manter | `problemas osteomusculares` |
| 339 | `frieira` | manter | `doenças de pele` |
| 340 | `frieiras` | → rótulo alt | `frieira` |
| 341 | `frio` | manter | `condições gerais e inespecíficas` |
| 342 | `fumo` | não tocar | — |
| 343 | `furúnculo` | manter | `doenças de pele` |
| 344 | `furúnculos` | → rótulo alt | `furúnculo` |
| 345 | `fígado` | → rótulo alt | `problemas do fígado` |
| 346 | `fígado e estômago` | depreciar → | `problemas do fígado` |
| 347 | `fígado e rins` | depreciar → | `problemas do fígado` |
| 348 | `fôlego` | manter | `problemas respiratórios` |
| 349 | `garganta` | manter | `problemas otorrinolaringológicos` |
| 350 | `garganta inflamada` | → rótulo alt | `inflamação na garganta` |
| 351 | `gargarejos para inflamação na garganta` | manter | `forma de preparo e administração` |
| 352 | `gases` | manter | `problemas digestivos` |
| 353 | `gases e cólicas abdominais` | → rótulo alt | `gases` |
| 354 | `gastrite` | manter | `problemas digestivos` |
| 355 | `gazes` | → rótulo oculto | `gases` |
| 356 | `gengiva` | manter | `problemas odontológicos` |
| 357 | `gordura no fígado` | manter | `problemas do fígado` |
| 358 | `gota` | manter | `problemas osteomusculares` |
| 359 | `gripe` | manter | `problemas respiratórios` |
| 360 | `gripe e resfriado` | depreciar → | `gripe` |
| 361 | `gripe e tosse` | depreciar → | `gripe` |
| 362 | `gripes` | → rótulo alt | `gripe` |
| 363 | `headache` | → rótulo alt | `dor de cabeça` |
| 364 | `healing` | → rótulo alt | `cicatrizante` |
| 365 | `hemorragia` | manter | `problemas circulatórios` |
| 366 | `hemorroidas` | manter | `problemas circulatórios` |
| 367 | `hemorróidas` | → rótulo oculto | `hemorroidas` |
| 368 | `hepatite` | manter | `problemas do fígado` |
| 369 | `herpes` | manter | `doenças de pele` |
| 370 | `high blood pressure` | → rótulo alt | `pressão alta` |
| 371 | `higiene` | manter | `cosmético e higiene` |
| 372 | `hipertensão` | → rótulo alt | `pressão alta` |
| 373 | `hipertensão arterial` | → rótulo alt | `pressão alta` |
| 374 | `hipotensão` | → rótulo alt | `pressão baixa` |
| 375 | `hoarseness` | → rótulo alt | `rouquidão` |
| 376 | `hurts` | → rótulo alt | `dor` |
| 377 | `icterícia` | manter | `problemas do fígado` |
| 378 | `ictéricia` | → rótulo oculto | `icterícia` |
| 379 | `impingem` | manter | `doenças de pele` |
| 380 | `impotência` | manter | `problemas do aparelho reprodutor masculino` |
| 381 | `impotência sexual` | → rótulo alt | `impotência` |
| 382 | `impurezas do sangue` | → rótulo alt | `sangue` |
| 383 | `inchaço` | → rótulo alt | `retenção de líquidos` |
| 384 | `inchaço nas pernas` | → rótulo alt | `retenção de líquidos` |
| 385 | `incontinência urinária` | manter | `problemas renais` |
| 386 | `indigestion` | → rótulo alt | `problemas digestivos` |
| 387 | `indigestão` | → rótulo alt | `má digestão` |
| 388 | `infecção` | manter | `doenças infecciosas e parasitárias` |
| 389 | `infecção de garganta` | → rótulo alt | `inflamação na garganta` |
| 390 | `infecção de ovário` | manter | `problemas ginecológicos e obstétricos` |
| 391 | `infecção de pele` | manter | `doenças de pele` |
| 392 | `infecção de urina` | → rótulo alt | `infecção urinária` |
| 393 | `infecção de útero` | → rótulo alt | `útero` |
| 394 | `infecção intestinal` | manter | `problemas digestivos` |
| 395 | `infecção no intestino` | → rótulo alt | `infecção intestinal` |
| 396 | `infecção no sangue` | → rótulo alt | `infecção` |
| 397 | `infecção pulmonar` | → rótulo alt | `pneumonia` |
| 398 | `infecção renal` | manter | `problemas renais` |
| 399 | `infecção urinaria` | → rótulo alt | `infecção urinária` |
| 400 | `infecção urinária` | manter | `problemas renais` |
| 401 | `infecção uterina` | → rótulo alt | `útero` |
| 402 | `infecções` | → rótulo alt | `infecção` |
| 403 | `infertilidade` | manter | `problemas ginecológicos e obstétricos` |
| 404 | `infertility` | → rótulo alt | `infertilidade` |
| 405 | `inflamamtion` | → rótulo oculto | `anti-inflamatório` |
| 406 | `inflamation` | → rótulo oculto | `anti-inflamatório` |
| 407 | `inflamação` | manter | `indicação terapêutica` |
| 408 | `inflamação da bexiga e rins` | → rótulo alt | `inflamação na bexiga` |
| 409 | `inflamação da garganta` | → rótulo alt | `inflamação na garganta` |
| 410 | `inflamação de garganta` | → rótulo alt | `inflamação na garganta` |
| 411 | `inflamação de útero` | → rótulo alt | `inflamação do útero` |
| 412 | `inflamação do estômago` | manter | `inflamação` |
| 413 | `inflamação do útero` | manter | `inflamação` |
| 414 | `inflamação e doenças do fígado` | → rótulo alt | `inflamação no fígado` |
| 415 | `inflamação em geral` | → rótulo alt | `inflamação` |
| 416 | `inflamação intestinal` | manter | `inflamação` |
| 417 | `inflamação na bexiga` | manter | `inflamação` |
| 418 | `inflamação na garganta` | manter | `inflamação` |
| 419 | `inflamação no corpo` | → rótulo alt | `inflamação` |
| 420 | `inflamação no fígado` | manter | `inflamação` |
| 421 | `inflamação no útero` | → rótulo alt | `inflamação do útero` |
| 422 | `inflamação nos dentes` | manter | `inflamação` |
| 423 | `inflamação ovariana` | manter | `inflamação` |
| 424 | `inflamações` | → rótulo alt | `inflamação` |
| 425 | `inflamações de ferida` | → rótulo alt | `ferida` |
| 426 | `inflamações na garganta` | → rótulo alt | `inflamação na garganta` |
| 427 | `inflammation` | → rótulo alt | `inflamação` |
| 428 | `inflammed throat` | → rótulo alt | `inflamação na garganta` |
| 429 | `inflações` | → rótulo alt | `inflamação` |
| 430 | `inseticida` | manter | `tóxico e defensivo` |
| 431 | `insônia` | manter | `problemas neurológicos e psíquicos` |
| 432 | `intestinal worms` | → rótulo alt | `verme` |
| 433 | `intestino` | → rótulo alt | `problemas digestivos` |
| 434 | `intestino preso` | → rótulo alt | `prisão de ventre` |
| 435 | `intestinos` | → rótulo alt | `problemas digestivos` |
| 436 | `intoxicação` | manter | `envenenamentos e picadas` |
| 437 | `intoxicação do fígado` | manter | `problemas do fígado` |
| 438 | `início de pneumonia` | → rótulo alt | `pneumonia` |
| 439 | `irritação da pele` | → rótulo alt | `doenças de pele` |
| 440 | `irritação na pele` | → rótulo alt | `doenças de pele` |
| 441 | `kidney stone` | → rótulo alt | `pedra nos rins` |
| 442 | `kidney stones` | → rótulo alt | `pedra nos rins` |
| 443 | `kills the larva of dengue` | → rótulo alt | `inseticida` |
| 444 | `labirintite` | manter | `problemas neurológicos e psíquicos` |
| 445 | `labyrinthitis` | → rótulo alt | `labirintite` |
| 446 | `lavar as mãos` | → rótulo alt | `higiene` |
| 447 | `lavar feridas` | → rótulo alt | `ferida` |
| 448 | `laxante` | manter | `ação farmacológica` |
| 449 | `lenha` | → rótulo alt | `combustível` |
| 450 | `limpar o sangue` | → rótulo alt | `depurativo` |
| 451 | `limpeza` | → rótulo alt | `higiene` |
| 452 | `limpeza do útero` | → rótulo alt | `útero` |
| 453 | `limpeza uterina` | → rótulo alt | `útero` |
| 454 | `linfoma` | manter | `neoplasias` |
| 455 | `litúrgico` | manter | `ritual e espiritual` |
| 456 | `lubrificante` | manter | `material e tecnológico` |
| 457 | `luxação` | manter | `problemas osteomusculares` |
| 458 | `luxações` | → rótulo alt | `luxação` |
| 459 | `lúdico` | manter | `ritual e espiritual` |
| 460 | `machucado` | → rótulo alt | `contusão` |
| 461 | `machucados` | → rótulo alt | `contusão` |
| 462 | `madeira` | manter | `material e tecnológico` |
| 463 | `mal de parkinson` | manter | `problemas neurológicos e psíquicos` |
| 464 | `mal estar` | → rótulo alt | `fraqueza` |
| 465 | `malária` | manter | `doenças infecciosas e parasitárias` |
| 466 | `mancha na pele` | manter | `doenças de pele` |
| 467 | `manejo (sementes para produção de mudas e repovoamento)` | → rótulo alt | `manejo` |
| 468 | `manejo de reações adversas` | depreciar → | `medicinal` |
| 469 | `manufatura` | → rótulo alt | `artesanato` |
| 470 | `matar larva da dengue` | → rótulo alt | `inseticida` |
| 471 | `mau hálito` | manter | `cosmético e higiene` |
| 472 | `medicinal` | manter | *(faceta raiz)* |
| 473 | `medicinal (seiva do palmito jovem para desinfecção, anestésico, coagulação do sangue)` | depreciar → | `medicinal` |
| 474 | `memória` | → rótulo alt | `esquecimento` |
| 475 | `menopausa` | manter | `problemas ginecológicos e obstétricos` |
| 476 | `menstruação` | manter | `problemas ginecológicos e obstétricos` |
| 477 | `menstruação atrasada` | → rótulo alt | `menstruação` |
| 478 | `menstruação dolorosa` | → rótulo alt | `cólica menstrual` |
| 479 | `micoses` | manter | `doenças de pele` |
| 480 | `mioma` | manter | `problemas ginecológicos e obstétricos` |
| 481 | `mordida de cobra` | → rótulo alt | `picada de cobra` |
| 482 | `mucosite oral` | manter | `problemas digestivos` |
| 483 | `má circulação do sangue` | → rótulo alt | `problemas circulatórios` |
| 484 | `má digestão` | manter | `problemas digestivos` |
| 485 | `mágico` | manter | `ritual e espiritual` |
| 486 | `místico` | manter | `ritual e espiritual` |
| 487 | `móveis` | manter | `material e tecnológico` |
| 488 | `músculos` | → rótulo alt | `dores musculares` |
| 489 | `nervos` | → rótulo alt | `nervosismo` |
| 490 | `nervosismo` | manter | `problemas neurológicos e psíquicos` |
| 491 | `nervoso` | → rótulo alt | `nervosismo` |
| 492 | `nevralgia` | manter | `dor` |
| 493 | `normalizar a pressão` | → rótulo alt | `pressão alta` |
| 494 | `náusea` | manter | `problemas digestivos` |
| 495 | `náuseas` | → rótulo alt | `náusea` |
| 496 | `não especificado` | depreciar → | `indeterminado` |
| 497 | `olho` | manter | `problemas oftálmicos` |
| 498 | `olho gordo` | manter | `ritual e espiritual` |
| 499 | `ornamental` | manter | `ambiental e ecológico` |
| 500 | `ossos` | manter | `problemas osteomusculares` |
| 501 | `outros` | depreciar → | `indeterminado` |
| 502 | `ouvido` | manter | `problemas otorrinolaringológicos` |
| 503 | `pain` | → rótulo alt | `dor` |
| 504 | `pain in the articulation` | → rótulo alt | `dor nas articulações` |
| 505 | `paisagístico` | manter | `ambiental e ecológico` |
| 506 | `palpitação do coração` | manter | `problemas do coração` |
| 507 | `palpitação no coração` | → rótulo alt | `palpitação do coração` |
| 508 | `palpitações` | → rótulo alt | `palpitação do coração` |
| 509 | `pancadas` | → rótulo alt | `contusão` |
| 510 | `panos` | → rótulo alt | `revestimento` |
| 511 | `para digestão` | → rótulo alt | `má digestão` |
| 512 | `para fazer a digestão` | → rótulo alt | `má digestão` |
| 513 | `para limpar a pele` | → rótulo alt | `doenças de pele` |
| 514 | `para o fígado` | → rótulo alt | `problemas do fígado` |
| 515 | `para queimaduras` | → rótulo alt | `queimadura` |
| 516 | `para recuperar do cansaço` | → rótulo alt | `cansaço` |
| 517 | `paralisia` | manter | `problemas neurológicos e psíquicos` |
| 518 | `parasitas` | manter | `doenças infecciosas e parasitárias` |
| 519 | `parto` | manter | `problemas ginecológicos e obstétricos` |
| 520 | `pedra na vesícula` | manter | `problemas do fígado` |
| 521 | `pedra no rim` | → rótulo alt | `pedra nos rins` |
| 522 | `pedra nos rins` | manter | `problemas renais` |
| 523 | `pedras nos rins` | → rótulo alt | `pedra nos rins` |
| 524 | `peito` | depreciar → | `indeterminado` |
| 525 | `pele` | → rótulo alt | `doenças de pele` |
| 526 | `perda de apetite` | → rótulo alt | `apetite` |
| 527 | `perda de peso` | → rótulo alt | `emagrecedor` |
| 528 | `pernas` | depreciar → | `indeterminado` |
| 529 | `pesca` | manter | `material e tecnológico` |
| 530 | `picada de abelha` | → rótulo alt | `picada de insetos` |
| 531 | `picada de aranha` | → rótulo alt | `picada de insetos` |
| 532 | `picada de cobra` | manter | `envenenamentos e picadas` |
| 533 | `picada de insetos` | manter | `envenenamentos e picadas` |
| 534 | `picada de mosquito` | → rótulo alt | `picada de insetos` |
| 535 | `picadas` | → rótulo alt | `picada de insetos` |
| 536 | `picadas de insetos` | → rótulo alt | `picada de insetos` |
| 537 | `pigmentação` | manter | `cosmético e higiene` |
| 538 | `piolho` | → rótulo alt | `parasitas` |
| 539 | `piorreia` | → rótulo alt | `gengiva` |
| 540 | `pneumonia` | manter | `problemas respiratórios` |
| 541 | `ponta de flecha` | manter | `material e tecnológico` |
| 542 | `pontada` | manter | `dor` |
| 543 | `pontadas (pneumonia)` | → rótulo alt | `pneumonia` |
| 544 | `porrete` | manter | `material e tecnológico` |
| 545 | `possível atividade antitumoral` | depreciar → | `medicinal` |
| 546 | `postema` | manter | `doenças de pele` |
| 547 | `postpartum confinement` | → rótulo alt | `parto` |
| 548 | `pressão` | → rótulo alt | `pressão alta` |
| 549 | `pressão alta` | manter | `problemas circulatórios` |
| 550 | `pressão baixa` | manter | `problemas circulatórios` |
| 551 | `prevenir a gripe` | → rótulo alt | `gripe` |
| 552 | `prevent stoke` | → rótulo oculto | `derrame` |
| 553 | `prevent stroke` | → rótulo alt | `derrame` |
| 554 | `prevenção de derrame` | → rótulo alt | `derrame` |
| 555 | `prisão de ventre` | manter | `problemas digestivos` |
| 556 | `problema de rim` | → rótulo alt | `problemas renais` |
| 557 | `problema no coração` | → rótulo alt | `problemas do coração` |
| 558 | `problema no fígado` | → rótulo alt | `problemas do fígado` |
| 559 | `problema nos rins` | → rótulo alt | `problemas renais` |
| 560 | `problema renal` | → rótulo alt | `problemas renais` |
| 561 | `problemas circulatórios` | manter | `problemas cardiovasculares` |
| 562 | `problemas com o fígado` | → rótulo alt | `problemas do fígado` |
| 563 | `problemas de dentição` | → rótulo alt | `dente` |
| 564 | `problemas de fígado` | → rótulo alt | `problemas do fígado` |
| 565 | `problemas de pele` | → rótulo alt | `doenças de pele` |
| 566 | `problemas de próstata` | → rótulo alt | `próstata` |
| 567 | `problemas de rins` | → rótulo alt | `problemas renais` |
| 568 | `problemas digestivos` | manter | `indicação terapêutica` |
| 569 | `problemas do coração` | manter | `problemas cardiovasculares` |
| 570 | `problemas do estômago` | → rótulo alt | `problemas digestivos` |
| 571 | `problemas do fígado` | manter | `indicação terapêutica` |
| 572 | `problemas estomacais` | → rótulo alt | `problemas digestivos` |
| 573 | `problemas na bexiga` | → rótulo alt | `bexiga` |
| 574 | `problemas na coluna` | → rótulo alt | `coluna` |
| 575 | `problemas na garganta` | → rótulo alt | `inflamação na garganta` |
| 576 | `problemas na próstata` | → rótulo alt | `próstata` |
| 577 | `problemas nas vias respiratórias` | → rótulo alt | `problemas respiratórios` |
| 578 | `problemas no coração` | → rótulo alt | `problemas do coração` |
| 579 | `problemas no fígado` | → rótulo alt | `problemas do fígado` |
| 580 | `problemas no pulmão` | → rótulo alt | `problemas respiratórios` |
| 581 | `problemas nos rins` | → rótulo alt | `problemas renais` |
| 582 | `problemas nos rins e bexiga` | → rótulo alt | `problemas renais` |
| 583 | `problemas pulmonares` | → rótulo alt | `problemas respiratórios` |
| 584 | `problemas renais` | manter | `indicação terapêutica` |
| 585 | `problemas respiratórios` | manter | `indicação terapêutica` |
| 586 | `problemas urinários` | → rótulo alt | `problemas renais` |
| 587 | `próstata` | manter | `problemas do aparelho reprodutor masculino` |
| 588 | `psoríase` | manter | `doenças de pele` |
| 589 | `pulmão` | → rótulo alt | `problemas respiratórios` |
| 590 | `purgante` | manter | `ação farmacológica` |
| 591 | `purificante` | → rótulo alt | `depurativo` |
| 592 | `purificar o sangue` | → rótulo alt | `depurativo` |
| 593 | `qualquer dor` | → rótulo alt | `dor` |
| 594 | `queda de cabelo` | manter | `cabelo` |
| 595 | `queimadura` | manter | `traumatismos e ferimentos` |
| 596 | `queimaduras` | → rótulo alt | `queimadura` |
| 597 | `queimar as verrugas` | → rótulo alt | `verrugas` |
| 598 | `queixo` | manter | `problemas odontológicos` |
| 599 | `quengo` | manter | `material e tecnológico` |
| 600 | `químico` | manter | `material e tecnológico` |
| 601 | `ralação` | manter | `material e tecnológico` |
| 602 | `raquitismo` | manter | `problemas osteomusculares` |
| 603 | `reconstituinte` | manter | `ação farmacológica` |
| 604 | `reduce the male libido` | → rótulo alt | `diminuir libido masculina` |
| 605 | `refrescante` | manter | `ação farmacológica` |
| 606 | `regulador da pressão arterial` | → rótulo alt | `pressão alta` |
| 607 | `regulador menstrual` | → rótulo alt | `menstruação` |
| 608 | `regular a menstruação` | → rótulo alt | `menstruação` |
| 609 | `regular a pressão` | → rótulo alt | `pressão alta` |
| 610 | `regular menstruação` | → rótulo alt | `menstruação` |
| 611 | `reinvigorate and gives energy` | → rótulo alt | `tonificante` |
| 612 | `reinvigorate and gives you energy` | → rótulo alt | `tonificante` |
| 613 | `relaxante` | manter | `ação farmacológica` |
| 614 | `relaxante muscular` | → rótulo alt | `relaxante` |
| 615 | `relaxar` | → rótulo alt | `calmante` |
| 616 | `remediar` | → rótulo alt | `remédio` |
| 617 | `remédio` | manter | `ação farmacológica` |
| 618 | `resfriado` | manter | `problemas respiratórios` |
| 619 | `resfriados` | → rótulo alt | `resfriado` |
| 620 | `resguardo pós-parto` | → rótulo alt | `parto` |
| 621 | `respiratório` | → rótulo alt | `problemas respiratórios` |
| 622 | `ressecamento` | manter | `doenças de pele` |
| 623 | `retenção de líquidos` | manter | `problemas renais` |
| 624 | `reumatismo` | manter | `problemas osteomusculares` |
| 625 | `revestimento` | manter | `construção` |
| 626 | `revigorar` | → rótulo alt | `tonificante` |
| 627 | `rim` | → rótulo alt | `problemas renais` |
| 628 | `rins` | → rótulo alt | `problemas renais` |
| 629 | `ritual` | manter | `ritual e espiritual` |
| 630 | `ritualístico` | → rótulo alt | `ritual` |
| 631 | `ronquidão` | → rótulo alt | `rouquidão` |
| 632 | `rouquidão` | manter | `problemas respiratórios` |
| 633 | `sangramento` | manter | `traumatismos e ferimentos` |
| 634 | `sangue` | manter | `problemas hematológicos` |
| 635 | `sapinho` | manter | `problemas digestivos` |
| 636 | `sarampo` | manter | `doenças infecciosas e parasitárias` |
| 637 | `sarna` | manter | `doenças infecciosas e parasitárias` |
| 638 | `saúde` | depreciar → | `medicinal` |
| 639 | `secreção` | → rótulo alt | `catarro` |
| 640 | `sedativo` | manter | `ação farmacológica` |
| 641 | `sedação` | → rótulo alt | `sedativo` |
| 642 | `seio` | manter | `problemas ginecológicos e obstétricos` |
| 643 | `sem uso reportado` | depreciar → | `indeterminado` |
| 644 | `sinusite` | manter | `problemas respiratórios` |
| 645 | `sistema nervoso` | → rótulo alt | `nervosismo` |
| 646 | `soluço` | manter | `problemas digestivos` |
| 647 | `sono` | → rótulo alt | `insônia` |
| 648 | `sonífero` | → rótulo alt | `sedativo` |
| 649 | `stomache` | → rótulo alt | `dor no estômago` |
| 650 | `sudorífico` | → rótulo alt | `diaforético` |
| 651 | `suor` | manter | `condições gerais e inespecíficas` |
| 652 | `suplemento para garrafadas` | depreciar → | `alimentar` |
| 653 | `sustento` | → rótulo alt | `alimentar` |
| 654 | `swollen` | → rótulo alt | `retenção de líquidos` |
| 655 | `taquicardia` | manter | `problemas do coração` |
| 656 | `tecnologia` | manter | `material e tecnológico` |
| 657 | `tecnologia social` | → rótulo alt | `tecnologia` |
| 658 | `tecnológica` | → rótulo alt | `tecnologia` |
| 659 | `tecnológico` | → rótulo alt | `tecnologia` |
| 660 | `tifo` | manter | `doenças infecciosas e parasitárias` |
| 661 | `to fever` | → rótulo alt | `antitérmico` |
| 662 | `tonificante` | manter | `ação farmacológica` |
| 663 | `tontura` | manter | `problemas neurológicos e psíquicos` |
| 664 | `torção` | → rótulo alt | `luxação` |
| 665 | `tosse` | manter | `problemas respiratórios` |
| 666 | `tosse calmante` | → rótulo alt | `tosse` |
| 667 | `tosse forte` | → rótulo alt | `tosse` |
| 668 | `tosses` | → rótulo alt | `tosse` |
| 669 | `tranquilizante` | → rótulo alt | `sedativo` |
| 670 | `tratamento de fígado e rins` | depreciar → | `problemas do fígado` |
| 671 | `tratamento de rins e fígado` | depreciar → | `problemas do fígado` |
| 672 | `tratar e curar a asma` | → rótulo alt | `asma` |
| 673 | `trato respiratório` | → rótulo alt | `problemas respiratórios` |
| 674 | `traumatismo` | manter | `traumatismos e ferimentos` |
| 675 | `triglicerídeos` | manter | `problemas metabólicos e endócrinos` |
| 676 | `tuberculose` | manter | `problemas respiratórios` |
| 677 | `tumor` | manter | `neoplasias` |
| 678 | `tumores` | → rótulo alt | `tumor` |
| 679 | `twists` | → rótulo alt | `luxação` |
| 680 | `tóxico` | manter | `tóxico e defensivo` |
| 681 | `urina trancada` | manter | `problemas renais` |
| 682 | `uropatia` | → rótulo alt | `problemas renais` |
| 683 | `urticária` | manter | `doenças de pele` |
| 684 | `utensílio` | manter | `material e tecnológico` |
| 685 | `utensílio doméstico` | → rótulo alt | `utensílio` |
| 686 | `utensílios` | → rótulo alt | `utensílio` |
| 687 | `utensílios (colchões com folhas)` | depreciar → | `utensílio` |
| 688 | `utensílios (moenda de cana e mundéu com estipe)` | depreciar → | `utensílio` |
| 689 | `utensílios (móveis como prateleira e estrado de cama com estipe)` | depreciar → | `utensílio` |
| 690 | `utensílios (trançados para caçar peixe com folhas)` | depreciar → | `utensílio` |
| 691 | `uterus, urinary and ovary infection` | depreciar → | `problemas ginecológicos e obstétricos` |
| 692 | `varizes` | manter | `problemas circulatórios` |
| 693 | `veias` | → rótulo alt | `problemas circulatórios` |
| 694 | `velas` | manter | `material e tecnológico` |
| 695 | `veneno` | manter | `tóxico e defensivo` |
| 696 | `verme` | manter | `doenças infecciosas e parasitárias` |
| 697 | `vermes` | → rótulo alt | `verme` |
| 698 | `vermes intestinais` | → rótulo alt | `verme` |
| 699 | `vermicida` | → rótulo alt | `vermífugo` |
| 700 | `verminose` | → rótulo alt | `verme` |
| 701 | `vermífugo` | manter | `ação farmacológica` |
| 702 | `verrugas` | manter | `doenças de pele` |
| 703 | `vertigem` | → rótulo alt | `tontura` |
| 704 | `vesícula` | manter | `problemas do fígado` |
| 705 | `vias urinárias` | → rótulo alt | `problemas renais` |
| 706 | `virose` | manter | `doenças infecciosas e parasitárias` |
| 707 | `vírus` | → rótulo alt | `virose` |
| 708 | `vômito` | manter | `problemas digestivos` |
| 709 | `vômitos` | → rótulo alt | `vômito` |
| 710 | `xarope` | manter | `forma de preparo e administração` |
| 711 | `úlcera` | manter | `problemas digestivos` |
| 712 | `úlceras` | → rótulo alt | `úlcera` |
| 713 | `útero` | manter | `problemas ginecológicos e obstétricos` |

## Conceitos que mais absorvem termos

| Conceito | Nº | Termos absorvidos |
|---|---:|---|
| `alimentar` | 12 | `alimentação`, `alimentação (palmito)`, `alimentação (vinho dos frutos)`, `alimentação humana`, `alimento`, `alimentício`, `chá de bebê`, `comida`, `cozinha`, `fome`, `suplemento para garrafadas`, `sustento` |
| `problemas do fígado` | 11 | `estômago e fígado`, `fígado`, `fígado e estômago`, `fígado e rins`, `para o fígado`, `problema no fígado`, `problemas com o fígado`, `problemas de fígado`, `problemas no fígado`, `tratamento de fígado e rins`, `tratamento de rins e fígado` |
| `problemas renais` | 11 | `problema de rim`, `problema nos rins`, `problema renal`, `problemas de rins`, `problemas nos rins`, `problemas nos rins e bexiga`, `problemas urinários`, `rim`, `rins`, `uropatia`, `vias urinárias` |
| `indeterminado` | 10 | `catuaba`, `corpo`, `doenças`, `dúvida`, `enferrujado`, `não especificado`, `outros`, `peito`, `pernas`, `sem uso reportado` |
| `pressão alta` | 10 | `baixa a pressão`, `baixar a pressão`, `controlar a pressão arterial`, `high blood pressure`, `hipertensão`, `hipertensão arterial`, `normalizar a pressão`, `pressão`, `regulador da pressão arterial`, `regular a pressão` |
| `problemas digestivos` | 8 | `digestão`, `distúrbio intestinal`, `estômago`, `indigestion`, `intestino`, `intestinos`, `problemas do estômago`, `problemas estomacais` |
| `cicatrizante` | 7 | `cicatrizar`, `cicatrizar feridas`, `cicatrizar feridas e úlceras`, `cicatrização`, `cicatrização de feridas`, `cicatrizing and muscular relaxant`, `healing` |
| `calmante` | 7 | `acalmar`, `calmante (nervoso)`, `calmante infantil`, `calmante natural`, `calmante para o coração`, `calmante para os nervos`, `relaxar` |
| `dor no estômago` | 7 | `dor de estomago`, `dor de estômago`, `dor no estomago`, `dores de estômago`, `dores estomacais`, `dores no estômago`, `stomache` |
| `inflamação na garganta` | 7 | `garganta inflamada`, `infecção de garganta`, `inflamação da garganta`, `inflamação de garganta`, `inflamações na garganta`, `inflammed throat`, `problemas na garganta` |
| `problemas respiratórios` | 7 | `doenças respiratórias`, `problemas nas vias respiratórias`, `problemas no pulmão`, `problemas pulmonares`, `pulmão`, `respiratório`, `trato respiratório` |
| `menstruação` | 7 | `ausência da menstruação`, `controls the period`, `falta de menstruação`, `menstruação atrasada`, `regulador menstrual`, `regular a menstruação`, `regular menstruação` |
| `utensílio` | 6 | `utensílio doméstico`, `utensílios`, `utensílios (colchões com folhas)`, `utensílios (moenda de cana e mundéu com estipe)`, `utensílios (móveis como prateleira e estrado de cama com estipe)`, `utensílios (trançados para caçar peixe com folhas)` |
| `depurativo` | 6 | `afinar o sangue`, `depurativo do sangue`, `desintoxicar`, `limpar o sangue`, `purificante`, `purificar o sangue` |
| `inflamação` | 6 | `dor e inflamação`, `inflamação em geral`, `inflamação no corpo`, `inflamações`, `inflammation`, `inflações` |
| `gripe` | 6 | `asma e tosse`, `flu`, `gripe e resfriado`, `gripe e tosse`, `gripes`, `prevenir a gripe` |
| `doenças de pele` | 6 | `doenças da pele`, `irritação da pele`, `irritação na pele`, `para limpar a pele`, `pele`, `problemas de pele` |
| `útero` | 6 | `caroço no útero`, `dores no útero`, `infecção de útero`, `infecção uterina`, `limpeza do útero`, `limpeza uterina` |
| `anti-inflamatório` | 5 | `anti-inflamatório geral`, `anti-inflammatory`, `antiinflamatório`, `inflamamtion`, `inflamation` |
| `sedativo` | 5 | `as depressant`, `depressant`, `sedação`, `sonífero`, `tranquilizante` |
| `tonificante` | 5 | `dar energia`, `energia`, `reinvigorate and gives energy`, `reinvigorate and gives you energy`, `revigorar` |
| `dor` | 5 | `dores em geral`, `dores no geral`, `hurts`, `pain`, `qualquer dor` |
| `verme` | 5 | `cólica provocada por vermes`, `intestinal worms`, `vermes`, `vermes intestinais`, `verminose` |
| `tosse` | 5 | `aliviar tosses`, `cough`, `tosse calmante`, `tosse forte`, `tosses` |
| `má digestão` | 5 | `dispepsia`, `fazer a digestão`, `indigestão`, `para digestão`, `para fazer a digestão` |
| `pedra nos rins` | 5 | `cálculo renal`, `kidney stone`, `kidney stones`, `pedra no rim`, `pedras nos rins` |
| `insônia` | 5 | `aliviar insônia`, `curar insônia`, `dar sono`, `dormir`, `sono` |
| `contusão` | 5 | `contusões`, `equimoses`, `machucado`, `machucados`, `pancadas` |
| `picada de insetos` | 5 | `picada de abelha`, `picada de aranha`, `picada de mosquito`, `picadas`, `picadas de insetos` |
| `cansaço` | 5 | `cansado`, `esgotamento`, `esgotamento físico`, `fadiga`, `para recuperar do cansaço` |
| `medicinal` | 4 | `manejo de reações adversas`, `medicinal (seiva do palmito jovem para desinfecção, anestésico, coagulação do sangue)`, `possível atividade antitumoral`, `saúde` |
| `dor nas costas` | 4 | `backache`, `dor lombar`, `dor na coluna`, `dor na espinha` |
| `cólica` | 4 | `cramps`, `cólicas`, `cólicas e dores`, `dores e cólicas` |
| `apetite` | 4 | `abre o apetite`, `abrir o apetite`, `falta de apetite`, `perda de apetite` |
| `retenção de líquidos` | 4 | `edema`, `inchaço`, `inchaço nas pernas`, `swollen` |
| `problemas do coração` | 4 | `coração`, `doença do coração`, `problema no coração`, `problemas no coração` |
| `problemas circulatórios` | 4 | `circulação`, `circulação do sangue`, `má circulação do sangue`, `veias` |
| `derrame` | 4 | `derrames`, `prevent stoke`, `prevent stroke`, `prevenção de derrame` |
| `nervosismo` | 4 | `crises nervosas`, `nervos`, `nervoso`, `sistema nervoso` |
| `luxação` | 4 | `entorses`, `luxações`, `torção`, `twists` |

## Pontos que exigem decisão humana

1. **44 rótulos em inglês** gravados com `language: "pt"` — ex.: `headache`, `flu`, `kidney stones`,
   `uterus, urinary and ovary infection`. A proposta os absorve como rótulos do conceito português
   equivalente; ao criá-los, o idioma deve ser corrigido para `eng`.
2. **9 grafias incorretas** viram rótulo oculto: `inflamamtion`, `inflamation`, `dor de estomago`, `dor no estomago`, `diarréia`, `gazes`, `ictéricia`, `hemorróidas`, `prevent stoke`.
3. **17 termos compostos** perdem informação ao serem depreciados para um único substituto —
   ex.: `gripe e tosse` → `gripe` descarta a tosse. Alternativa: rótulo oculto em ambos os conceitos.
4. **11 termos sem conteúdo** vão para a faceta `indeterminado`, criada porque `deprecate` **exige**
   `replacedById` e não há substituto legítimo para `outros`, `dúvida` ou `não especificado`.
5. **`fumo`** é nome vernacular que caiu neste campo; o conceito é válido sob `comunidades.plantas.nomeVernacular`
   e não deve ser tocado. `artesanato` e `pesca` pertencem legitimamente a dois campos e são mantidos.
