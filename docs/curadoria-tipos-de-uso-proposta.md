# Proposta de curadoria — Campo Semântico "Tipos de Usos de Plantas"

> **Estado: PROPOSTA. Nada foi escrito na tabela `etnotermos` a título de curadoria.**
> Gerada em 2026-08-06 a partir dos 713 conceitos cujo `sourceFields` contém
> `comunidades.plantas.tipoUso`, em `/data/biocultdb.sqlite` (produção, Unraid `Asilo`, 192.168.1.10).
> Backups verificados: `backup-pre-curadoria-tipouso-2026-08-06T17-45-03Z.sqlite` e
> `backup-pre-deploy-2026-08-06T18-11-58Z.sqlite`.
> Critérios: `docs/Manual.md`. Decisões (D1–D11), riscos e procedimento:
> [`curadoria-tipos-de-uso-procedimento.md`](curadoria-tipos-de-uso-procedimento.md).

## Resumo

| Métrica | Valor |
|---|---:|
| Termos de entrada | 713 |
| Conceitos mantidos, com posição na hierarquia | 297 |
| Conceitos mantidos sem pai, por ambiguidade não resolvida | 4 |
| Conceitos-pai novos a criar | 31 |
| Termos absorvidos como rótulo alternativo | 358 |
| Termos absorvidos como rótulo oculto (grafia incorreta) | 9 |
| Termos compostos, preservados como oculto em **dois** conceitos | 12 |
| Termos apenas depreciados (qualificadores e sem conteúdo) | 32 |
| Termos intocados (pertencem a outro campo semântico) | 1 |
| **Conceitos sobreviventes** | **332** |
| → a **ativar** | 302 |
| → a deixar **`candidate`** para sua revisão | 30 |
| Redução do vocabulário | **53%** |

## Os 30 conceitos que NÃO serão ativados

Ficam `candidate`, invisíveis na consulta pública, esperando seu julgamento. Esta é a lista
curta prometida: se você concordar com ela, não precisa ler as 713 linhas abaixo.

| Conceito | Por que não tenho segurança |
|---|---|
| `anticorpos` | não é enfermidade nem ação clássica; sob alergias e imunológicos por falta de lugar melhor |
| `apertar os dentes` | pode ser bruxismo (odontológico) ou o ato de mastigar a planta (forma de preparo). |
| `arame` | objeto; provável amarração/fibra, não confirmado |
| `arrepiamento` | sintoma ou efeito? não determinei se é calafrio, piloereção ou uso ritual |
| `balanço` | pode ser o brinquedo, a rede ou um preparo; indeterminado |
| `banho` | sob ritual e espiritual, mas banho também é via de administração medicinal e higiene |
| `batidas` | pode ser palpitação cardíaca ou pancada/contusão — duas facetas diferentes. |
| `caibro` | nomeia a peça, não o uso; sobrevive sob construção, mas talvez devesse ser rótulo |
| `canal` | pode ser calha de construção ou canal do corpo; ambíguo entre duas facetas |
| `cerne` | o lenho interno é matéria-prima, mas "cerne" sozinho não nomeia um uso |
| `chaqueiro` | termo não identificado; nenhuma leitura etnobotânica segura |
| `chá` | sob alimentar, mas chá é sobretudo forma de preparo medicinal |
| `dentadura` | a prótese ou a dentição? classifiquei em cosmético e higiene sem base |
| `esfolantes` | provável esfoliante, mas a grafia não confirma; deixei em ação farmacológica |
| `espectro` | pode ser aparição (ritual) ou outra coisa; classificado em ritual por eliminação |
| `espinhela caída` | enfermidade popular real, mas o encaixe sob dor é discutível |
| `fio` | pode ser fibra têxtil ou linha de amarrar; não determinei |
| `fisioterápico` | uso não farmacológico dentro de ação farmacológica; encaixe forçado |
| `frio` | pode ser calafrio (sintoma), sensação térmica ou refrescante; ambíguo |
| `lúdico` | uso recreativo plausível, sem evidência no corpus |
| `olho` | parte do corpo sem enfermidade; sob oftálmico por proximidade |
| `panos` | "pano branco" é micose (dermatológico), mas "panos" também é tecido/revestimento. Absorver em qualquer um dos dois seria escolher sem base. |
| `pigmentação` | classifiquei em cosmético, mas pode ser mancha de pele (dermatológico) |
| `porrete` | objeto; uso não declarado (arma? pilão?) |
| `queixo` | parte do corpo sem enfermidade associada; não sei que uso representa |
| `quengo` | significado regional indeterminado (crânio? cuia de coco?); posição em material e tecnológico é chute |
| `químico` | uso químico genérico, sem indicação do que a planta faz |
| `ralação` | pode ser o utensílio (ralador) ou o ato de ralar no preparo; indeterminado |
| `seio` | parte do corpo sem enfermidade; sob ginecológico por proximidade |
| `sustento` | pode ser alimento de subsistência (alimentar) ou renda (comercial). |

Os quatro sem pai (`panos`, `batidas`, `apertar os dentes`, `sustento`) chegaram a ser absorvidos
como rótulo de outro conceito numa versão anterior desta proposta. Foram promovidos de volta a
conceito próprio: absorver deprecia o conceito de origem, e fazer isso com base num palpite é
a única operação deste plano que seria difícil de desfazer sem perder proveniência.

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
- apertar os dentes
- batidas
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
- panos
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
- sustento
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
| `manter` | Conceito próprio sob o pai indicado. | `POST /concepts/:id/broader` |
| `manter sem pai (candidate)` | Conceito próprio, sem hierarquia, não ativado: o termo é ambíguo e a escolha é sua. | nenhuma relação |
| `→ rótulo alt` | Variante válida: plural, sinônimo, tradução, variante de regência. | `POST /concepts/:alvo/labels` (`type=alt`) |
| `→ rótulo oculto` | Grafia incorreta: invisível ao público, encontrável na busca. | `POST /concepts/:alvo/labels` (`type=hidden`) |
| `→ rótulo oculto em dois` | Termo composto: oculto nos **dois** conceitos que nomeia. | dois `POST …/labels` + `deprecate` |
| `depreciar →` | Qualificador colado ao núcleo, ou termo sem conteúdo. | `POST /concepts/:id/deprecate` |
| `não tocar` | Pertence de fato a outro campo semântico. | nenhum |

## Decisão termo a termo

| # | Termo | Operação | Destino / Pai | Status final |
|---:|---|---|---|---|
| 1 | `abortivo` | manter | `ação farmacológica` | `active` |
| 2 | `aborto` | → rótulo alt | `abortivo` | *(depreciado)* |
| 3 | `abre o apetite` | → rótulo alt | `apetite` | *(depreciado)* |
| 4 | `abrir o apetite` | → rótulo alt | `apetite` | *(depreciado)* |
| 5 | `acalmar` | → rótulo alt | `calmante` | *(depreciado)* |
| 6 | `acidez no estômago` | → rótulo alt | `azia` | *(depreciado)* |
| 7 | `afinar o sangue` | → rótulo alt | `depurativo` | *(depreciado)* |
| 8 | `alergia` | manter | `alergias e problemas imunológicos` | `active` |
| 9 | `alergias` | → rótulo alt | `alergia` | *(depreciado)* |
| 10 | `alimentar` | manter | *(faceta raiz)* | `active` |
| 11 | `alimentação` | → rótulo alt | `alimentar` | *(depreciado)* |
| 12 | `alimentação (palmito)` | depreciar → | `alimentar` | *(depreciado)* |
| 13 | `alimentação (vinho dos frutos)` | depreciar → | `alimentar` | *(depreciado)* |
| 14 | `alimentação animal` | → rótulo alt | `forragem` | *(depreciado)* |
| 15 | `alimentação humana` | → rótulo alt | `alimentar` | *(depreciado)* |
| 16 | `alimento` | → rótulo alt | `alimentar` | *(depreciado)* |
| 17 | `alimentício` | → rótulo alt | `alimentar` | *(depreciado)* |
| 18 | `aliviar insônia` | → rótulo alt | `insônia` | *(depreciado)* |
| 19 | `aliviar tosses` | → rótulo alt | `tosse` | *(depreciado)* |
| 20 | `ambiental` | manter | `ambiental e ecológico` | `active` |
| 21 | `ameba` | manter | `doenças infecciosas e parasitárias` | `active` |
| 22 | `analgésico` | manter | `ação farmacológica` | `active` |
| 23 | `anemia` | manter | `problemas hematológicos` | `active` |
| 24 | `anti-inflamatório` | manter | `ação farmacológica` | `active` |
| 25 | `anti-inflamatório geral` | → rótulo alt | `anti-inflamatório` | *(depreciado)* |
| 26 | `anti-inflammatory` | → rótulo alt | `anti-inflamatório` | *(depreciado)* |
| 27 | `antibiótico` | manter | `ação farmacológica` | `active` |
| 28 | `anticorpos` | manter | `alergias e problemas imunológicos` | **`candidate`** |
| 29 | `anticâncer` | manter | `ação farmacológica` | `active` |
| 30 | `antidepressivo` | manter | `ação farmacológica` | `active` |
| 31 | `antidiabético` | manter | `ação farmacológica` | `active` |
| 32 | `antiespasmódico` | manter | `ação farmacológica` | `active` |
| 33 | `antigripal` | manter | `ação farmacológica` | `active` |
| 34 | `antiinflamatório` | → rótulo alt | `anti-inflamatório` | *(depreciado)* |
| 35 | `antisséptico` | manter | `ação farmacológica` | `active` |
| 36 | `antitérmico` | manter | `ação farmacológica` | `active` |
| 37 | `antiviral` | manter | `ação farmacológica` | `active` |
| 38 | `apertar os dentes` | manter sem pai (candidate) | — | **`candidate`** |
| 39 | `apetite` | manter | `problemas digestivos` | `active` |
| 40 | `arame` | manter | `material e tecnológico` | **`candidate`** |
| 41 | `ardor ao urinar` | manter | `problemas renais` | `active` |
| 42 | `ardor no estômago` | → rótulo alt | `azia` | *(depreciado)* |
| 43 | `arranhões` | → rótulo alt | `cortes` | *(depreciado)* |
| 44 | `arrepiamento` | manter | `condições gerais e inespecíficas` | **`candidate`** |
| 45 | `artesanal` | → rótulo alt | `artesanato` | *(depreciado)* |
| 46 | `artesanal (confecção de artesanato com sementes)` | depreciar → | `artesanato` | *(depreciado)* |
| 47 | `artesanato` | manter | `material e tecnológico` | `active` |
| 48 | `artrite` | manter | `problemas osteomusculares` | `active` |
| 49 | `as depressant` | → rótulo alt | `sedativo` | *(depreciado)* |
| 50 | `asma` | manter | `problemas respiratórios` | `active` |
| 51 | `asma brônquica` | → rótulo alt | `asma` | *(depreciado)* |
| 52 | `asma e tosse` | → rótulo oculto em dois | `asma` + `tosse` | *(depreciado)* |
| 53 | `aumentar o leite quando estiver amamentando` | → rótulo alt | `parto` | *(depreciado)* |
| 54 | `ausência da menstruação` | → rótulo alt | `menstruação` | *(depreciado)* |
| 55 | `azia` | manter | `problemas digestivos` | `active` |
| 56 | `backache` | → rótulo alt | `dor nas costas` | *(depreciado)* |
| 57 | `baixa a pressão` | → rótulo alt | `pressão alta` | *(depreciado)* |
| 58 | `baixar a febre` | → rótulo alt | `febre` | *(depreciado)* |
| 59 | `baixar a pressão` | → rótulo alt | `pressão alta` | *(depreciado)* |
| 60 | `baixar o colesterol` | → rótulo alt | `colesterol` | *(depreciado)* |
| 61 | `baixar os triglicerídeos` | → rótulo alt | `triglicerídeos` | *(depreciado)* |
| 62 | `baixo astral` | → rótulo alt | `depressão` | *(depreciado)* |
| 63 | `balanço` | manter | `material e tecnológico` | **`candidate`** |
| 64 | `banho` | manter | `ritual e espiritual` | **`candidate`** |
| 65 | `banho de assento` | → rótulo alt | `banho` | *(depreciado)* |
| 66 | `bath seat` | → rótulo alt | `banho` | *(depreciado)* |
| 67 | `batidas` | manter sem pai (candidate) | — | **`candidate`** |
| 68 | `bexiga` | manter | `problemas renais` | `active` |
| 69 | `bicho de pé` | → rótulo alt | `parasitas` | *(depreciado)* |
| 70 | `boca ferida` | manter | `problemas digestivos` | `active` |
| 71 | `broken bone` | → rótulo alt | `fraturas` | *(depreciado)* |
| 72 | `bronquite` | manter | `problemas respiratórios` | `active` |
| 73 | `bronquite asmática` | → rótulo alt | `bronquite` | *(depreciado)* |
| 74 | `bronquites` | → rótulo alt | `bronquite` | *(depreciado)* |
| 75 | `bócio` | manter | `problemas metabólicos e endócrinos` | `active` |
| 76 | `cabelo` | manter | `cosmético e higiene` | `active` |
| 77 | `caibro` | manter | `construção` | **`candidate`** |
| 78 | `calmante` | manter | `ação farmacológica` | `active` |
| 79 | `calmante (nervoso)` | depreciar → | `calmante` | *(depreciado)* |
| 80 | `calmante infantil` | depreciar → | `calmante` | *(depreciado)* |
| 81 | `calmante natural` | → rótulo alt | `calmante` | *(depreciado)* |
| 82 | `calmante para o coração` | depreciar → | `calmante` | *(depreciado)* |
| 83 | `calmante para os nervos` | depreciar → | `calmante` | *(depreciado)* |
| 84 | `calos` | manter | `doenças de pele` | `active` |
| 85 | `canal` | manter | `construção` | **`candidate`** |
| 86 | `cancer` | → rótulo alt | `câncer` | *(depreciado)* |
| 87 | `cancro` | manter | `doenças infecciosas e parasitárias` | `active` |
| 88 | `cansado` | → rótulo alt | `cansaço` | *(depreciado)* |
| 89 | `cansaço` | manter | `condições gerais e inespecíficas` | `active` |
| 90 | `cardiorritmo` | manter | `problemas do coração` | `active` |
| 91 | `caroço no útero` | → rótulo alt | `útero` | *(depreciado)* |
| 92 | `caspa` | manter | `cabelo` | `active` |
| 93 | `catarro` | manter | `problemas respiratórios` | `active` |
| 94 | `catarro no peito` | → rótulo alt | `catarro` | *(depreciado)* |
| 95 | `catarro pulmonar` | → rótulo alt | `catarro` | *(depreciado)* |
| 96 | `catuaba` | depreciar → | `indeterminado` | *(depreciado)* |
| 97 | `causar vômito` | manter | `ação farmacológica` | `active` |
| 98 | `caxumba` | manter | `problemas otorrinolaringológicos` | `active` |
| 99 | `caça` | manter | `material e tecnológico` | `active` |
| 100 | `cerne` | manter | `construção` | **`candidate`** |
| 101 | `cesto` | manter | `material e tecnológico` | `active` |
| 102 | `chagas` | manter | `doenças infecciosas e parasitárias` | `active` |
| 103 | `chaqueiro` | manter | `material e tecnológico` | **`candidate`** |
| 104 | `chá` | manter | `alimentar` | **`candidate`** |
| 105 | `chá (bebida recreativa)` | → rótulo alt | `chá` | *(depreciado)* |
| 106 | `chá de bebê` | depreciar → | `alimentar` | *(depreciado)* |
| 107 | `cicatrizante` | manter | `ação farmacológica` | `active` |
| 108 | `cicatrizar` | → rótulo alt | `cicatrizante` | *(depreciado)* |
| 109 | `cicatrizar feridas` | → rótulo alt | `cicatrizante` | *(depreciado)* |
| 110 | `cicatrizar feridas e úlceras` | → rótulo alt | `cicatrizante` | *(depreciado)* |
| 111 | `cicatrização` | → rótulo alt | `cicatrizante` | *(depreciado)* |
| 112 | `cicatrização de feridas` | → rótulo alt | `cicatrizante` | *(depreciado)* |
| 113 | `cicatrizing and muscular relaxant` | → rótulo alt | `cicatrizante` | *(depreciado)* |
| 114 | `circulação` | → rótulo alt | `problemas circulatórios` | *(depreciado)* |
| 115 | `circulação do sangue` | → rótulo alt | `problemas circulatórios` | *(depreciado)* |
| 116 | `cirrose` | manter | `problemas do fígado` | `active` |
| 117 | `clister` | → rótulo alt | `purgante` | *(depreciado)* |
| 118 | `cobertura (folhas para coberturas temporárias, barracos, capovas, galinheiros, canteiros, viveiros)` | depreciar → | `construção` | *(depreciado)* |
| 119 | `cobreiro` | manter | `doenças de pele` | `active` |
| 120 | `coceira` | manter | `doenças de pele` | `active` |
| 121 | `coceiras` | → rótulo alt | `coceira` | *(depreciado)* |
| 122 | `colesterol` | manter | `problemas metabólicos e endócrinos` | `active` |
| 123 | `colesterol alto` | → rótulo alt | `colesterol` | *(depreciado)* |
| 124 | `colesterol e diabetes` | → rótulo oculto em dois | `colesterol` + `diabetes` | *(depreciado)* |
| 125 | `coluna` | manter | `problemas osteomusculares` | `active` |
| 126 | `combate o reumatismo` | → rótulo alt | `reumatismo` | *(depreciado)* |
| 127 | `combustível` | manter | `material e tecnológico` | `active` |
| 128 | `comercial (venda do palmito)` | depreciar → | `comercial` | *(depreciado)* |
| 129 | `comida` | → rótulo alt | `alimentar` | *(depreciado)* |
| 130 | `comércio` | → rótulo alt | `comercial` | *(depreciado)* |
| 131 | `condimento` | manter | `alimentar` | `active` |
| 132 | `congestão` | manter | `problemas respiratórios` | `active` |
| 133 | `conjuntivite` | manter | `problemas oftálmicos` | `active` |
| 134 | `constipação` | → rótulo alt | `prisão de ventre` | *(depreciado)* |
| 135 | `construção` | manter | `material e tecnológico` | `active` |
| 136 | `construção (caibros e ripas com estipe)` | depreciar → | `construção` | *(depreciado)* |
| 137 | `construção (esteios com estipe)` | depreciar → | `construção` | *(depreciado)* |
| 138 | `contra feitiçaria` | manter | `ritual e espiritual` | `active` |
| 139 | `contra queda de cabelo` | → rótulo alt | `queda de cabelo` | *(depreciado)* |
| 140 | `contraceptivo` | manter | `ação farmacológica` | `active` |
| 141 | `controlar a pressão arterial` | → rótulo alt | `pressão alta` | *(depreciado)* |
| 142 | `controls the period` | → rótulo alt | `menstruação` | *(depreciado)* |
| 143 | `contusão` | manter | `problemas osteomusculares` | `active` |
| 144 | `contusões` | → rótulo alt | `contusão` | *(depreciado)* |
| 145 | `coqueluche` | manter | `problemas respiratórios` | `active` |
| 146 | `corante` | manter | `material e tecnológico` | `active` |
| 147 | `coração` | → rótulo alt | `problemas do coração` | *(depreciado)* |
| 148 | `corpo` | depreciar → | `indeterminado` | *(depreciado)* |
| 149 | `corpo ruim` | → rótulo alt | `fraqueza` | *(depreciado)* |
| 150 | `corrimento` | manter | `problemas ginecológicos e obstétricos` | `active` |
| 151 | `cortar veneno de cobra` | → rótulo alt | `picada de cobra` | *(depreciado)* |
| 152 | `cortes` | manter | `traumatismos e ferimentos` | `active` |
| 153 | `cosmético` | manter | `cosmético e higiene` | `active` |
| 154 | `cough` | → rótulo alt | `tosse` | *(depreciado)* |
| 155 | `cozinha` | depreciar → | `alimentar` | *(depreciado)* |
| 156 | `cramps` | → rótulo alt | `cólica` | *(depreciado)* |
| 157 | `crescer cabelo` | manter | `cabelo` | `active` |
| 158 | `crises nervosas` | → rótulo alt | `nervosismo` | *(depreciado)* |
| 159 | `cuidados pessoais` | → rótulo alt | `higiene` | *(depreciado)* |
| 160 | `cura` | → rótulo alt | `remédio` | *(depreciado)* |
| 161 | `cura de furúnculos` | → rótulo alt | `furúnculo` | *(depreciado)* |
| 162 | `curar a asma` | → rótulo alt | `asma` | *(depreciado)* |
| 163 | `curar insônia` | → rótulo alt | `insônia` | *(depreciado)* |
| 164 | `cálculo renal` | → rótulo alt | `pedra nos rins` | *(depreciado)* |
| 165 | `câncer` | manter | `neoplasias` | `active` |
| 166 | `câncer de próstata` | → rótulo alt | `câncer` | *(depreciado)* |
| 167 | `cólica` | manter | `dor` | `active` |
| 168 | `cólica de bebê` | manter | `cólica` | `active` |
| 169 | `cólica de rins` | → rótulo alt | `cólica renal` | *(depreciado)* |
| 170 | `cólica de útero` | manter | `cólica` | `active` |
| 171 | `cólica menstrual` | manter | `cólica` | `active` |
| 172 | `cólica provocada por vermes` | → rótulo alt | `verme` | *(depreciado)* |
| 173 | `cólica renal` | manter | `cólica` | `active` |
| 174 | `cólica uterina` | → rótulo alt | `cólica de útero` | *(depreciado)* |
| 175 | `cólicas` | → rótulo alt | `cólica` | *(depreciado)* |
| 176 | `cólicas do fígado` | manter | `cólica` | `active` |
| 177 | `cólicas do fígado e estômago` | → rótulo alt | `cólicas do fígado` | *(depreciado)* |
| 178 | `cólicas e dores` | → rótulo alt | `cólica` | *(depreciado)* |
| 179 | `cólicas intestinais` | manter | `problemas digestivos` | `active` |
| 180 | `cólicas menstruais` | → rótulo alt | `cólica menstrual` | *(depreciado)* |
| 181 | `dar energia` | → rótulo alt | `tonificante` | *(depreciado)* |
| 182 | `dar sono` | → rótulo alt | `insônia` | *(depreciado)* |
| 183 | `defumador` | → rótulo alt | `defumação` | *(depreciado)* |
| 184 | `defumação` | manter | `ritual e espiritual` | `active` |
| 185 | `dengue` | manter | `doenças infecciosas e parasitárias` | `active` |
| 186 | `dentadura` | manter | `cosmético e higiene` | **`candidate`** |
| 187 | `dente` | manter | `problemas odontológicos` | `active` |
| 188 | `dentição` | → rótulo alt | `dente` | *(depreciado)* |
| 189 | `depressant` | → rótulo alt | `sedativo` | *(depreciado)* |
| 190 | `depression` | → rótulo alt | `depressão` | *(depreciado)* |
| 191 | `depressão` | manter | `problemas neurológicos e psíquicos` | `active` |
| 192 | `depurativo` | manter | `ação farmacológica` | `active` |
| 193 | `depurativo do sangue` | → rótulo alt | `depurativo` | *(depreciado)* |
| 194 | `derrame` | manter | `problemas circulatórios` | `active` |
| 195 | `derrames` | → rótulo alt | `derrame` | *(depreciado)* |
| 196 | `descarrego` | manter | `ritual e espiritual` | `active` |
| 197 | `desinfetante` | manter | `cosmético e higiene` | `active` |
| 198 | `desintoxicar` | → rótulo alt | `depurativo` | *(depreciado)* |
| 199 | `desintoxicação alimentar` | → rótulo alt | `intoxicação` | *(depreciado)* |
| 200 | `desânimo` | → rótulo alt | `depressão` | *(depreciado)* |
| 201 | `diabete` | → rótulo alt | `diabetes` | *(depreciado)* |
| 202 | `diabetes` | manter | `problemas metabólicos e endócrinos` | `active` |
| 203 | `diaforético` | manter | `ação farmacológica` | `active` |
| 204 | `diarreia` | manter | `problemas digestivos` | `active` |
| 205 | `diarréia` | → rótulo oculto | `diarreia` | *(depreciado)* |
| 206 | `digestivo` | manter | `ação farmacológica` | `active` |
| 207 | `digestão` | → rótulo alt | `problemas digestivos` | *(depreciado)* |
| 208 | `diminuir calores da menopausa` | → rótulo alt | `menopausa` | *(depreciado)* |
| 209 | `diminuir libido masculina` | manter | `problemas do aparelho reprodutor masculino` | `active` |
| 210 | `disenteria` | → rótulo alt | `diarreia` | *(depreciado)* |
| 211 | `disfunção erétil` | → rótulo alt | `impotência` | *(depreciado)* |
| 212 | `dispepsia` | → rótulo alt | `má digestão` | *(depreciado)* |
| 213 | `distúrbio intestinal` | → rótulo alt | `problemas digestivos` | *(depreciado)* |
| 214 | `diurético` | manter | `ação farmacológica` | `active` |
| 215 | `doce` | manter | `alimentar` | `active` |
| 216 | `doença do coração` | → rótulo alt | `problemas do coração` | *(depreciado)* |
| 217 | `doença venérea` | manter | `doenças infecciosas e parasitárias` | `active` |
| 218 | `doenças` | depreciar → | `indeterminado` | *(depreciado)* |
| 219 | `doenças como o câncer` | → rótulo alt | `câncer` | *(depreciado)* |
| 220 | `doenças da pele` | → rótulo alt | `doenças de pele` | *(depreciado)* |
| 221 | `doenças de pele` | manter | `indicação terapêutica` | `active` |
| 222 | `doenças dos olhos` | → rótulo alt | `olho` | *(depreciado)* |
| 223 | `doenças respiratórias` | → rótulo alt | `problemas respiratórios` | *(depreciado)* |
| 224 | `doenças venéreas` | → rótulo alt | `doença venérea` | *(depreciado)* |
| 225 | `dor` | manter | `indicação terapêutica` | `active` |
| 226 | `dor abdominal` | → rótulo alt | `dor de barriga` | *(depreciado)* |
| 227 | `dor corporal` | → rótulo alt | `dor no corpo` | *(depreciado)* |
| 228 | `dor de barriga` | manter | `dor` | `active` |
| 229 | `dor de cabeça` | manter | `dor` | `active` |
| 230 | `dor de dente` | manter | `dor` | `active` |
| 231 | `dor de dente (antiinflamatório)` | → rótulo alt | `dor de dente` | *(depreciado)* |
| 232 | `dor de dente e cabeça` | → rótulo oculto em dois | `dor de dente` + `dor de cabeça` | *(depreciado)* |
| 233 | `dor de estomago` | → rótulo oculto | `dor no estômago` | *(depreciado)* |
| 234 | `dor de estômago` | → rótulo alt | `dor no estômago` | *(depreciado)* |
| 235 | `dor de garganta` | manter | `dor` | `active` |
| 236 | `dor de ouvido` | manter | `dor` | `active` |
| 237 | `dor de rins` | → rótulo alt | `dor nos rins` | *(depreciado)* |
| 238 | `dor do peito` | → rótulo alt | `dor no peito` | *(depreciado)* |
| 239 | `dor e inflamação` | → rótulo oculto em dois | `dor` + `inflamação` | *(depreciado)* |
| 240 | `dor lombar` | → rótulo alt | `dor nas costas` | *(depreciado)* |
| 241 | `dor na bacia` | manter | `dor` | `active` |
| 242 | `dor na barriga` | → rótulo alt | `dor de barriga` | *(depreciado)* |
| 243 | `dor na coluna` | → rótulo alt | `dor nas costas` | *(depreciado)* |
| 244 | `dor na espinha` | → rótulo alt | `dor nas costas` | *(depreciado)* |
| 245 | `dor nas articulações` | manter | `dor` | `active` |
| 246 | `dor nas costas` | manter | `dor` | `active` |
| 247 | `dor nas juntas` | → rótulo alt | `dor nas articulações` | *(depreciado)* |
| 248 | `dor nas pernas` | manter | `dor` | `active` |
| 249 | `dor no corpo` | manter | `dor` | `active` |
| 250 | `dor no estomago` | → rótulo oculto | `dor no estômago` | *(depreciado)* |
| 251 | `dor no estômago` | manter | `dor` | `active` |
| 252 | `dor no fígado` | manter | `dor` | `active` |
| 253 | `dor no intestino` | manter | `dor` | `active` |
| 254 | `dor no peito` | manter | `dor` | `active` |
| 255 | `dor no pulmão` | manter | `dor` | `active` |
| 256 | `dor nos ossos` | manter | `dor` | `active` |
| 257 | `dor nos rins` | manter | `dor` | `active` |
| 258 | `dor para enxaqueca` | → rótulo alt | `enxaqueca` | *(depreciado)* |
| 259 | `dores` | → rótulo alt | `dor no corpo` | *(depreciado)* |
| 260 | `dores de cabeça` | → rótulo alt | `dor de cabeça` | *(depreciado)* |
| 261 | `dores de estômago` | → rótulo alt | `dor no estômago` | *(depreciado)* |
| 262 | `dores e cólicas` | → rótulo alt | `cólica` | *(depreciado)* |
| 263 | `dores em geral` | → rótulo alt | `dor` | *(depreciado)* |
| 264 | `dores estomacais` | → rótulo alt | `dor no estômago` | *(depreciado)* |
| 265 | `dores musculares` | manter | `dor` | `active` |
| 266 | `dores na bexiga` | → rótulo alt | `bexiga` | *(depreciado)* |
| 267 | `dores nas articulações` | → rótulo alt | `dor nas articulações` | *(depreciado)* |
| 268 | `dores no corpo` | → rótulo alt | `dor no corpo` | *(depreciado)* |
| 269 | `dores no estômago` | → rótulo alt | `dor no estômago` | *(depreciado)* |
| 270 | `dores no estômago e fígado` | → rótulo alt | `dor no fígado` | *(depreciado)* |
| 271 | `dores no geral` | → rótulo alt | `dor` | *(depreciado)* |
| 272 | `dores no peito` | → rótulo alt | `dor no peito` | *(depreciado)* |
| 273 | `dores no útero` | → rótulo alt | `útero` | *(depreciado)* |
| 274 | `dormir` | → rótulo alt | `insônia` | *(depreciado)* |
| 275 | `dúvida` | depreciar → | `indeterminado` | *(depreciado)* |
| 276 | `ease the heat from the menopause` | → rótulo alt | `menopausa` | *(depreciado)* |
| 277 | `ecológico (atração de animais para caça)` | → rótulo alt | `ambiental` | *(depreciado)* |
| 278 | `eczemas` | manter | `doenças de pele` | `active` |
| 279 | `edema` | → rótulo alt | `retenção de líquidos` | *(depreciado)* |
| 280 | `elimina o colesterol ruim` | → rótulo alt | `colesterol` | *(depreciado)* |
| 281 | `emagrecedor` | manter | `ação farmacológica` | `active` |
| 282 | `emagrecer` | → rótulo alt | `emagrecedor` | *(depreciado)* |
| 283 | `emagrecimento` | → rótulo alt | `emagrecedor` | *(depreciado)* |
| 284 | `emplastro` | manter | `forma de preparo e administração` | `active` |
| 285 | `energia` | → rótulo alt | `tonificante` | *(depreciado)* |
| 286 | `enferrujado` | depreciar → | `indeterminado` | *(depreciado)* |
| 287 | `enjoo` | manter | `problemas digestivos` | `active` |
| 288 | `entorses` | → rótulo alt | `luxação` | *(depreciado)* |
| 289 | `envenenamento` | → rótulo alt | `intoxicação` | *(depreciado)* |
| 290 | `enxaqueca` | manter | `dor` | `active` |
| 291 | `epilepsia` | manter | `problemas neurológicos e psíquicos` | `active` |
| 292 | `equimoses` | → rótulo alt | `contusão` | *(depreciado)* |
| 293 | `erupção cutânea` | manter | `doenças de pele` | `active` |
| 294 | `escorbuto` | manter | `doenças infecciosas e parasitárias` | `active` |
| 295 | `escoriações` | → rótulo alt | `cortes` | *(depreciado)* |
| 296 | `escorregadio` | → rótulo alt | `lubrificante` | *(depreciado)* |
| 297 | `esfolantes` | manter | `ação farmacológica` | **`candidate`** |
| 298 | `esgotamento` | → rótulo alt | `cansaço` | *(depreciado)* |
| 299 | `esgotamento físico` | → rótulo alt | `cansaço` | *(depreciado)* |
| 300 | `espectro` | manter | `ritual e espiritual` | **`candidate`** |
| 301 | `espinha` | manter | `doenças de pele` | `active` |
| 302 | `espinhela caída` | manter | `dor` | **`candidate`** |
| 303 | `espiritual` | manter | `ritual e espiritual` | `active` |
| 304 | `esquecimento` | manter | `problemas neurológicos e psíquicos` | `active` |
| 305 | `estimulante` | manter | `ação farmacológica` | `active` |
| 306 | `estimulante sexual` | → rótulo alt | `estimulante` | *(depreciado)* |
| 307 | `estresse` | manter | `problemas neurológicos e psíquicos` | `active` |
| 308 | `estômago` | → rótulo alt | `problemas digestivos` | *(depreciado)* |
| 309 | `estômago e fígado` | → rótulo oculto em dois | `problemas digestivos` + `problemas do fígado` | *(depreciado)* |
| 310 | `excitante` | → rótulo alt | `estimulante` | *(depreciado)* |
| 311 | `expectorante` | manter | `ação farmacológica` | `active` |
| 312 | `fadiga` | → rótulo alt | `cansaço` | *(depreciado)* |
| 313 | `falta de apetite` | → rótulo alt | `apetite` | *(depreciado)* |
| 314 | `falta de ar` | manter | `problemas respiratórios` | `active` |
| 315 | `falta de memória` | → rótulo alt | `esquecimento` | *(depreciado)* |
| 316 | `falta de menstruação` | → rótulo alt | `menstruação` | *(depreciado)* |
| 317 | `fazer a digestão` | → rótulo alt | `má digestão` | *(depreciado)* |
| 318 | `febre` | manter | `indicação terapêutica` | `active` |
| 319 | `febres` | → rótulo alt | `febre` | *(depreciado)* |
| 320 | `ferida` | manter | `traumatismos e ferimentos` | `active` |
| 321 | `feridas` | → rótulo alt | `ferida` | *(depreciado)* |
| 322 | `ferimento` | manter | `traumatismos e ferimentos` | `active` |
| 323 | `ferimentos` | → rótulo alt | `ferimento` | *(depreciado)* |
| 324 | `fever` | → rótulo alt | `febre` | *(depreciado)* |
| 325 | `fio` | manter | `material e tecnológico` | **`candidate`** |
| 326 | `fisioterápico` | manter | `ação farmacológica` | **`candidate`** |
| 327 | `flatulência` | manter | `problemas digestivos` | `active` |
| 328 | `flu` | → rótulo alt | `gripe` | *(depreciado)* |
| 329 | `fome` | → rótulo alt | `alimentar` | *(depreciado)* |
| 330 | `fonte genética` | manter | `ambiental e ecológico` | `active` |
| 331 | `forragem` | manter | `veterinário e forrageiro` | `active` |
| 332 | `forragem (folhas para burros e cavalos)` | → rótulo alt | `forragem` | *(depreciado)* |
| 333 | `fortalecer os ossos` | → rótulo alt | `ossos` | *(depreciado)* |
| 334 | `fortificante` | manter | `ação farmacológica` | `active` |
| 335 | `fortificar a memória` | → rótulo alt | `esquecimento` | *(depreciado)* |
| 336 | `fraqueza` | manter | `condições gerais e inespecíficas` | `active` |
| 337 | `fraqueza em geral` | → rótulo alt | `fraqueza` | *(depreciado)* |
| 338 | `fraturas` | manter | `problemas osteomusculares` | `active` |
| 339 | `frieira` | manter | `doenças de pele` | `active` |
| 340 | `frieiras` | → rótulo alt | `frieira` | *(depreciado)* |
| 341 | `frio` | manter | `condições gerais e inespecíficas` | **`candidate`** |
| 342 | `fumo` | não tocar | — | *(depreciado)* |
| 343 | `furúnculo` | manter | `doenças de pele` | `active` |
| 344 | `furúnculos` | → rótulo alt | `furúnculo` | *(depreciado)* |
| 345 | `fígado` | → rótulo alt | `problemas do fígado` | *(depreciado)* |
| 346 | `fígado e estômago` | → rótulo oculto em dois | `problemas do fígado` + `problemas digestivos` | *(depreciado)* |
| 347 | `fígado e rins` | → rótulo oculto em dois | `problemas do fígado` + `problemas renais` | *(depreciado)* |
| 348 | `fôlego` | manter | `problemas respiratórios` | `active` |
| 349 | `garganta` | manter | `problemas otorrinolaringológicos` | `active` |
| 350 | `garganta inflamada` | → rótulo alt | `inflamação na garganta` | *(depreciado)* |
| 351 | `gargarejos para inflamação na garganta` | manter | `forma de preparo e administração` | `active` |
| 352 | `gases` | manter | `problemas digestivos` | `active` |
| 353 | `gases e cólicas abdominais` | → rótulo alt | `gases` | *(depreciado)* |
| 354 | `gastrite` | manter | `problemas digestivos` | `active` |
| 355 | `gazes` | → rótulo oculto | `gases` | *(depreciado)* |
| 356 | `gengiva` | manter | `problemas odontológicos` | `active` |
| 357 | `gordura no fígado` | manter | `problemas do fígado` | `active` |
| 358 | `gota` | manter | `problemas osteomusculares` | `active` |
| 359 | `gripe` | manter | `problemas respiratórios` | `active` |
| 360 | `gripe e resfriado` | → rótulo oculto em dois | `gripe` + `resfriado` | *(depreciado)* |
| 361 | `gripe e tosse` | → rótulo oculto em dois | `gripe` + `tosse` | *(depreciado)* |
| 362 | `gripes` | → rótulo alt | `gripe` | *(depreciado)* |
| 363 | `headache` | → rótulo alt | `dor de cabeça` | *(depreciado)* |
| 364 | `healing` | → rótulo alt | `cicatrizante` | *(depreciado)* |
| 365 | `hemorragia` | manter | `problemas circulatórios` | `active` |
| 366 | `hemorroidas` | manter | `problemas circulatórios` | `active` |
| 367 | `hemorróidas` | → rótulo oculto | `hemorroidas` | *(depreciado)* |
| 368 | `hepatite` | manter | `problemas do fígado` | `active` |
| 369 | `herpes` | manter | `doenças de pele` | `active` |
| 370 | `high blood pressure` | → rótulo alt | `pressão alta` | *(depreciado)* |
| 371 | `higiene` | manter | `cosmético e higiene` | `active` |
| 372 | `hipertensão` | → rótulo alt | `pressão alta` | *(depreciado)* |
| 373 | `hipertensão arterial` | → rótulo alt | `pressão alta` | *(depreciado)* |
| 374 | `hipotensão` | → rótulo alt | `pressão baixa` | *(depreciado)* |
| 375 | `hoarseness` | → rótulo alt | `rouquidão` | *(depreciado)* |
| 376 | `hurts` | → rótulo alt | `dor` | *(depreciado)* |
| 377 | `icterícia` | manter | `problemas do fígado` | `active` |
| 378 | `ictéricia` | → rótulo oculto | `icterícia` | *(depreciado)* |
| 379 | `impingem` | manter | `doenças de pele` | `active` |
| 380 | `impotência` | manter | `problemas do aparelho reprodutor masculino` | `active` |
| 381 | `impotência sexual` | → rótulo alt | `impotência` | *(depreciado)* |
| 382 | `impurezas do sangue` | → rótulo alt | `sangue` | *(depreciado)* |
| 383 | `inchaço` | → rótulo alt | `retenção de líquidos` | *(depreciado)* |
| 384 | `inchaço nas pernas` | → rótulo alt | `retenção de líquidos` | *(depreciado)* |
| 385 | `incontinência urinária` | manter | `problemas renais` | `active` |
| 386 | `indigestion` | → rótulo alt | `problemas digestivos` | *(depreciado)* |
| 387 | `indigestão` | → rótulo alt | `má digestão` | *(depreciado)* |
| 388 | `infecção` | manter | `doenças infecciosas e parasitárias` | `active` |
| 389 | `infecção de garganta` | → rótulo alt | `inflamação na garganta` | *(depreciado)* |
| 390 | `infecção de ovário` | manter | `problemas ginecológicos e obstétricos` | `active` |
| 391 | `infecção de pele` | manter | `doenças de pele` | `active` |
| 392 | `infecção de urina` | → rótulo alt | `infecção urinária` | *(depreciado)* |
| 393 | `infecção de útero` | → rótulo alt | `útero` | *(depreciado)* |
| 394 | `infecção intestinal` | manter | `problemas digestivos` | `active` |
| 395 | `infecção no intestino` | → rótulo alt | `infecção intestinal` | *(depreciado)* |
| 396 | `infecção no sangue` | → rótulo alt | `infecção` | *(depreciado)* |
| 397 | `infecção pulmonar` | → rótulo alt | `pneumonia` | *(depreciado)* |
| 398 | `infecção renal` | manter | `problemas renais` | `active` |
| 399 | `infecção urinaria` | → rótulo alt | `infecção urinária` | *(depreciado)* |
| 400 | `infecção urinária` | manter | `problemas renais` | `active` |
| 401 | `infecção uterina` | → rótulo alt | `útero` | *(depreciado)* |
| 402 | `infecções` | → rótulo alt | `infecção` | *(depreciado)* |
| 403 | `infertilidade` | manter | `problemas ginecológicos e obstétricos` | `active` |
| 404 | `infertility` | → rótulo alt | `infertilidade` | *(depreciado)* |
| 405 | `inflamamtion` | → rótulo oculto | `anti-inflamatório` | *(depreciado)* |
| 406 | `inflamation` | → rótulo oculto | `anti-inflamatório` | *(depreciado)* |
| 407 | `inflamação` | manter | `indicação terapêutica` | `active` |
| 408 | `inflamação da bexiga e rins` | → rótulo alt | `inflamação na bexiga` | *(depreciado)* |
| 409 | `inflamação da garganta` | → rótulo alt | `inflamação na garganta` | *(depreciado)* |
| 410 | `inflamação de garganta` | → rótulo alt | `inflamação na garganta` | *(depreciado)* |
| 411 | `inflamação de útero` | → rótulo alt | `inflamação do útero` | *(depreciado)* |
| 412 | `inflamação do estômago` | manter | `inflamação` | `active` |
| 413 | `inflamação do útero` | manter | `inflamação` | `active` |
| 414 | `inflamação e doenças do fígado` | → rótulo alt | `inflamação no fígado` | *(depreciado)* |
| 415 | `inflamação em geral` | → rótulo alt | `inflamação` | *(depreciado)* |
| 416 | `inflamação intestinal` | manter | `inflamação` | `active` |
| 417 | `inflamação na bexiga` | manter | `inflamação` | `active` |
| 418 | `inflamação na garganta` | manter | `inflamação` | `active` |
| 419 | `inflamação no corpo` | → rótulo alt | `inflamação` | *(depreciado)* |
| 420 | `inflamação no fígado` | manter | `inflamação` | `active` |
| 421 | `inflamação no útero` | → rótulo alt | `inflamação do útero` | *(depreciado)* |
| 422 | `inflamação nos dentes` | manter | `inflamação` | `active` |
| 423 | `inflamação ovariana` | manter | `inflamação` | `active` |
| 424 | `inflamações` | → rótulo alt | `inflamação` | *(depreciado)* |
| 425 | `inflamações de ferida` | → rótulo alt | `ferida` | *(depreciado)* |
| 426 | `inflamações na garganta` | → rótulo alt | `inflamação na garganta` | *(depreciado)* |
| 427 | `inflammation` | → rótulo alt | `inflamação` | *(depreciado)* |
| 428 | `inflammed throat` | → rótulo alt | `inflamação na garganta` | *(depreciado)* |
| 429 | `inflações` | → rótulo alt | `inflamação` | *(depreciado)* |
| 430 | `inseticida` | manter | `tóxico e defensivo` | `active` |
| 431 | `insônia` | manter | `problemas neurológicos e psíquicos` | `active` |
| 432 | `intestinal worms` | → rótulo alt | `verme` | *(depreciado)* |
| 433 | `intestino` | → rótulo alt | `problemas digestivos` | *(depreciado)* |
| 434 | `intestino preso` | → rótulo alt | `prisão de ventre` | *(depreciado)* |
| 435 | `intestinos` | → rótulo alt | `problemas digestivos` | *(depreciado)* |
| 436 | `intoxicação` | manter | `envenenamentos e picadas` | `active` |
| 437 | `intoxicação do fígado` | manter | `problemas do fígado` | `active` |
| 438 | `início de pneumonia` | → rótulo alt | `pneumonia` | *(depreciado)* |
| 439 | `irritação da pele` | → rótulo alt | `doenças de pele` | *(depreciado)* |
| 440 | `irritação na pele` | → rótulo alt | `doenças de pele` | *(depreciado)* |
| 441 | `kidney stone` | → rótulo alt | `pedra nos rins` | *(depreciado)* |
| 442 | `kidney stones` | → rótulo alt | `pedra nos rins` | *(depreciado)* |
| 443 | `kills the larva of dengue` | → rótulo alt | `inseticida` | *(depreciado)* |
| 444 | `labirintite` | manter | `problemas neurológicos e psíquicos` | `active` |
| 445 | `labyrinthitis` | → rótulo alt | `labirintite` | *(depreciado)* |
| 446 | `lavar as mãos` | → rótulo alt | `higiene` | *(depreciado)* |
| 447 | `lavar feridas` | → rótulo alt | `ferida` | *(depreciado)* |
| 448 | `laxante` | manter | `ação farmacológica` | `active` |
| 449 | `lenha` | → rótulo alt | `combustível` | *(depreciado)* |
| 450 | `limpar o sangue` | → rótulo alt | `depurativo` | *(depreciado)* |
| 451 | `limpeza` | → rótulo alt | `higiene` | *(depreciado)* |
| 452 | `limpeza do útero` | → rótulo alt | `útero` | *(depreciado)* |
| 453 | `limpeza uterina` | → rótulo alt | `útero` | *(depreciado)* |
| 454 | `linfoma` | manter | `neoplasias` | `active` |
| 455 | `litúrgico` | manter | `ritual e espiritual` | `active` |
| 456 | `lubrificante` | manter | `material e tecnológico` | `active` |
| 457 | `luxação` | manter | `problemas osteomusculares` | `active` |
| 458 | `luxações` | → rótulo alt | `luxação` | *(depreciado)* |
| 459 | `lúdico` | manter | `ritual e espiritual` | **`candidate`** |
| 460 | `machucado` | → rótulo alt | `contusão` | *(depreciado)* |
| 461 | `machucados` | → rótulo alt | `contusão` | *(depreciado)* |
| 462 | `madeira` | manter | `material e tecnológico` | `active` |
| 463 | `mal de parkinson` | manter | `problemas neurológicos e psíquicos` | `active` |
| 464 | `mal estar` | → rótulo alt | `fraqueza` | *(depreciado)* |
| 465 | `malária` | manter | `doenças infecciosas e parasitárias` | `active` |
| 466 | `mancha na pele` | manter | `doenças de pele` | `active` |
| 467 | `manejo (sementes para produção de mudas e repovoamento)` | → rótulo alt | `manejo` | *(depreciado)* |
| 468 | `manejo de reações adversas` | depreciar → | `medicinal` | *(depreciado)* |
| 469 | `manufatura` | → rótulo alt | `artesanato` | *(depreciado)* |
| 470 | `matar larva da dengue` | → rótulo alt | `inseticida` | *(depreciado)* |
| 471 | `mau hálito` | manter | `cosmético e higiene` | `active` |
| 472 | `medicinal` | manter | *(faceta raiz)* | `active` |
| 473 | `medicinal (seiva do palmito jovem para desinfecção, anestésico, coagulação do sangue)` | depreciar → | `medicinal` | *(depreciado)* |
| 474 | `memória` | → rótulo alt | `esquecimento` | *(depreciado)* |
| 475 | `menopausa` | manter | `problemas ginecológicos e obstétricos` | `active` |
| 476 | `menstruação` | manter | `problemas ginecológicos e obstétricos` | `active` |
| 477 | `menstruação atrasada` | → rótulo alt | `menstruação` | *(depreciado)* |
| 478 | `menstruação dolorosa` | → rótulo alt | `cólica menstrual` | *(depreciado)* |
| 479 | `micoses` | manter | `doenças de pele` | `active` |
| 480 | `mioma` | manter | `problemas ginecológicos e obstétricos` | `active` |
| 481 | `mordida de cobra` | → rótulo alt | `picada de cobra` | *(depreciado)* |
| 482 | `mucosite oral` | manter | `problemas digestivos` | `active` |
| 483 | `má circulação do sangue` | → rótulo alt | `problemas circulatórios` | *(depreciado)* |
| 484 | `má digestão` | manter | `problemas digestivos` | `active` |
| 485 | `mágico` | manter | `ritual e espiritual` | `active` |
| 486 | `místico` | manter | `ritual e espiritual` | `active` |
| 487 | `móveis` | manter | `material e tecnológico` | `active` |
| 488 | `músculos` | → rótulo alt | `dores musculares` | *(depreciado)* |
| 489 | `nervos` | → rótulo alt | `nervosismo` | *(depreciado)* |
| 490 | `nervosismo` | manter | `problemas neurológicos e psíquicos` | `active` |
| 491 | `nervoso` | → rótulo alt | `nervosismo` | *(depreciado)* |
| 492 | `nevralgia` | manter | `dor` | `active` |
| 493 | `normalizar a pressão` | → rótulo alt | `pressão alta` | *(depreciado)* |
| 494 | `náusea` | manter | `problemas digestivos` | `active` |
| 495 | `náuseas` | → rótulo alt | `náusea` | *(depreciado)* |
| 496 | `não especificado` | depreciar → | `indeterminado` | *(depreciado)* |
| 497 | `olho` | manter | `problemas oftálmicos` | **`candidate`** |
| 498 | `olho gordo` | manter | `ritual e espiritual` | `active` |
| 499 | `ornamental` | manter | `ambiental e ecológico` | `active` |
| 500 | `ossos` | manter | `problemas osteomusculares` | `active` |
| 501 | `outros` | depreciar → | `indeterminado` | *(depreciado)* |
| 502 | `ouvido` | manter | `problemas otorrinolaringológicos` | `active` |
| 503 | `pain` | → rótulo alt | `dor` | *(depreciado)* |
| 504 | `pain in the articulation` | → rótulo alt | `dor nas articulações` | *(depreciado)* |
| 505 | `paisagístico` | manter | `ambiental e ecológico` | `active` |
| 506 | `palpitação do coração` | manter | `problemas do coração` | `active` |
| 507 | `palpitação no coração` | → rótulo alt | `palpitação do coração` | *(depreciado)* |
| 508 | `palpitações` | → rótulo alt | `palpitação do coração` | *(depreciado)* |
| 509 | `pancadas` | → rótulo alt | `contusão` | *(depreciado)* |
| 510 | `panos` | manter sem pai (candidate) | — | **`candidate`** |
| 511 | `para digestão` | → rótulo alt | `má digestão` | *(depreciado)* |
| 512 | `para fazer a digestão` | → rótulo alt | `má digestão` | *(depreciado)* |
| 513 | `para limpar a pele` | → rótulo alt | `doenças de pele` | *(depreciado)* |
| 514 | `para o fígado` | → rótulo alt | `problemas do fígado` | *(depreciado)* |
| 515 | `para queimaduras` | → rótulo alt | `queimadura` | *(depreciado)* |
| 516 | `para recuperar do cansaço` | → rótulo alt | `cansaço` | *(depreciado)* |
| 517 | `paralisia` | manter | `problemas neurológicos e psíquicos` | `active` |
| 518 | `parasitas` | manter | `doenças infecciosas e parasitárias` | `active` |
| 519 | `parto` | manter | `problemas ginecológicos e obstétricos` | `active` |
| 520 | `pedra na vesícula` | manter | `problemas do fígado` | `active` |
| 521 | `pedra no rim` | → rótulo alt | `pedra nos rins` | *(depreciado)* |
| 522 | `pedra nos rins` | manter | `problemas renais` | `active` |
| 523 | `pedras nos rins` | → rótulo alt | `pedra nos rins` | *(depreciado)* |
| 524 | `peito` | depreciar → | `indeterminado` | *(depreciado)* |
| 525 | `pele` | → rótulo alt | `doenças de pele` | *(depreciado)* |
| 526 | `perda de apetite` | → rótulo alt | `apetite` | *(depreciado)* |
| 527 | `perda de peso` | → rótulo alt | `emagrecedor` | *(depreciado)* |
| 528 | `pernas` | depreciar → | `indeterminado` | *(depreciado)* |
| 529 | `pesca` | manter | `material e tecnológico` | `active` |
| 530 | `picada de abelha` | → rótulo alt | `picada de insetos` | *(depreciado)* |
| 531 | `picada de aranha` | → rótulo alt | `picada de insetos` | *(depreciado)* |
| 532 | `picada de cobra` | manter | `envenenamentos e picadas` | `active` |
| 533 | `picada de insetos` | manter | `envenenamentos e picadas` | `active` |
| 534 | `picada de mosquito` | → rótulo alt | `picada de insetos` | *(depreciado)* |
| 535 | `picadas` | → rótulo alt | `picada de insetos` | *(depreciado)* |
| 536 | `picadas de insetos` | → rótulo alt | `picada de insetos` | *(depreciado)* |
| 537 | `pigmentação` | manter | `cosmético e higiene` | **`candidate`** |
| 538 | `piolho` | → rótulo alt | `parasitas` | *(depreciado)* |
| 539 | `piorreia` | → rótulo alt | `gengiva` | *(depreciado)* |
| 540 | `pneumonia` | manter | `problemas respiratórios` | `active` |
| 541 | `ponta de flecha` | manter | `material e tecnológico` | `active` |
| 542 | `pontada` | manter | `dor` | `active` |
| 543 | `pontadas (pneumonia)` | → rótulo alt | `pneumonia` | *(depreciado)* |
| 544 | `porrete` | manter | `material e tecnológico` | **`candidate`** |
| 545 | `possível atividade antitumoral` | depreciar → | `medicinal` | *(depreciado)* |
| 546 | `postema` | manter | `doenças de pele` | `active` |
| 547 | `postpartum confinement` | → rótulo alt | `parto` | *(depreciado)* |
| 548 | `pressão` | → rótulo alt | `pressão alta` | *(depreciado)* |
| 549 | `pressão alta` | manter | `problemas circulatórios` | `active` |
| 550 | `pressão baixa` | manter | `problemas circulatórios` | `active` |
| 551 | `prevenir a gripe` | → rótulo alt | `gripe` | *(depreciado)* |
| 552 | `prevent stoke` | → rótulo oculto | `derrame` | *(depreciado)* |
| 553 | `prevent stroke` | → rótulo alt | `derrame` | *(depreciado)* |
| 554 | `prevenção de derrame` | → rótulo alt | `derrame` | *(depreciado)* |
| 555 | `prisão de ventre` | manter | `problemas digestivos` | `active` |
| 556 | `problema de rim` | → rótulo alt | `problemas renais` | *(depreciado)* |
| 557 | `problema no coração` | → rótulo alt | `problemas do coração` | *(depreciado)* |
| 558 | `problema no fígado` | → rótulo alt | `problemas do fígado` | *(depreciado)* |
| 559 | `problema nos rins` | → rótulo alt | `problemas renais` | *(depreciado)* |
| 560 | `problema renal` | → rótulo alt | `problemas renais` | *(depreciado)* |
| 561 | `problemas circulatórios` | manter | `problemas cardiovasculares` | `active` |
| 562 | `problemas com o fígado` | → rótulo alt | `problemas do fígado` | *(depreciado)* |
| 563 | `problemas de dentição` | → rótulo alt | `dente` | *(depreciado)* |
| 564 | `problemas de fígado` | → rótulo alt | `problemas do fígado` | *(depreciado)* |
| 565 | `problemas de pele` | → rótulo alt | `doenças de pele` | *(depreciado)* |
| 566 | `problemas de próstata` | → rótulo alt | `próstata` | *(depreciado)* |
| 567 | `problemas de rins` | → rótulo alt | `problemas renais` | *(depreciado)* |
| 568 | `problemas digestivos` | manter | `indicação terapêutica` | `active` |
| 569 | `problemas do coração` | manter | `problemas cardiovasculares` | `active` |
| 570 | `problemas do estômago` | → rótulo alt | `problemas digestivos` | *(depreciado)* |
| 571 | `problemas do fígado` | manter | `indicação terapêutica` | `active` |
| 572 | `problemas estomacais` | → rótulo alt | `problemas digestivos` | *(depreciado)* |
| 573 | `problemas na bexiga` | → rótulo alt | `bexiga` | *(depreciado)* |
| 574 | `problemas na coluna` | → rótulo alt | `coluna` | *(depreciado)* |
| 575 | `problemas na garganta` | → rótulo alt | `inflamação na garganta` | *(depreciado)* |
| 576 | `problemas na próstata` | → rótulo alt | `próstata` | *(depreciado)* |
| 577 | `problemas nas vias respiratórias` | → rótulo alt | `problemas respiratórios` | *(depreciado)* |
| 578 | `problemas no coração` | → rótulo alt | `problemas do coração` | *(depreciado)* |
| 579 | `problemas no fígado` | → rótulo alt | `problemas do fígado` | *(depreciado)* |
| 580 | `problemas no pulmão` | → rótulo alt | `problemas respiratórios` | *(depreciado)* |
| 581 | `problemas nos rins` | → rótulo alt | `problemas renais` | *(depreciado)* |
| 582 | `problemas nos rins e bexiga` | → rótulo alt | `problemas renais` | *(depreciado)* |
| 583 | `problemas pulmonares` | → rótulo alt | `problemas respiratórios` | *(depreciado)* |
| 584 | `problemas renais` | manter | `indicação terapêutica` | `active` |
| 585 | `problemas respiratórios` | manter | `indicação terapêutica` | `active` |
| 586 | `problemas urinários` | → rótulo alt | `problemas renais` | *(depreciado)* |
| 587 | `próstata` | manter | `problemas do aparelho reprodutor masculino` | `active` |
| 588 | `psoríase` | manter | `doenças de pele` | `active` |
| 589 | `pulmão` | → rótulo alt | `problemas respiratórios` | *(depreciado)* |
| 590 | `purgante` | manter | `ação farmacológica` | `active` |
| 591 | `purificante` | → rótulo alt | `depurativo` | *(depreciado)* |
| 592 | `purificar o sangue` | → rótulo alt | `depurativo` | *(depreciado)* |
| 593 | `qualquer dor` | → rótulo alt | `dor` | *(depreciado)* |
| 594 | `queda de cabelo` | manter | `cabelo` | `active` |
| 595 | `queimadura` | manter | `traumatismos e ferimentos` | `active` |
| 596 | `queimaduras` | → rótulo alt | `queimadura` | *(depreciado)* |
| 597 | `queimar as verrugas` | → rótulo alt | `verrugas` | *(depreciado)* |
| 598 | `queixo` | manter | `problemas odontológicos` | **`candidate`** |
| 599 | `quengo` | manter | `material e tecnológico` | **`candidate`** |
| 600 | `químico` | manter | `material e tecnológico` | **`candidate`** |
| 601 | `ralação` | manter | `material e tecnológico` | **`candidate`** |
| 602 | `raquitismo` | manter | `problemas osteomusculares` | `active` |
| 603 | `reconstituinte` | manter | `ação farmacológica` | `active` |
| 604 | `reduce the male libido` | → rótulo alt | `diminuir libido masculina` | *(depreciado)* |
| 605 | `refrescante` | manter | `ação farmacológica` | `active` |
| 606 | `regulador da pressão arterial` | → rótulo alt | `pressão alta` | *(depreciado)* |
| 607 | `regulador menstrual` | → rótulo alt | `menstruação` | *(depreciado)* |
| 608 | `regular a menstruação` | → rótulo alt | `menstruação` | *(depreciado)* |
| 609 | `regular a pressão` | → rótulo alt | `pressão alta` | *(depreciado)* |
| 610 | `regular menstruação` | → rótulo alt | `menstruação` | *(depreciado)* |
| 611 | `reinvigorate and gives energy` | → rótulo alt | `tonificante` | *(depreciado)* |
| 612 | `reinvigorate and gives you energy` | → rótulo alt | `tonificante` | *(depreciado)* |
| 613 | `relaxante` | manter | `ação farmacológica` | `active` |
| 614 | `relaxante muscular` | → rótulo alt | `relaxante` | *(depreciado)* |
| 615 | `relaxar` | → rótulo alt | `calmante` | *(depreciado)* |
| 616 | `remediar` | → rótulo alt | `remédio` | *(depreciado)* |
| 617 | `remédio` | manter | `ação farmacológica` | `active` |
| 618 | `resfriado` | manter | `problemas respiratórios` | `active` |
| 619 | `resfriados` | → rótulo alt | `resfriado` | *(depreciado)* |
| 620 | `resguardo pós-parto` | → rótulo alt | `parto` | *(depreciado)* |
| 621 | `respiratório` | → rótulo alt | `problemas respiratórios` | *(depreciado)* |
| 622 | `ressecamento` | manter | `doenças de pele` | `active` |
| 623 | `retenção de líquidos` | manter | `problemas renais` | `active` |
| 624 | `reumatismo` | manter | `problemas osteomusculares` | `active` |
| 625 | `revestimento` | manter | `construção` | `active` |
| 626 | `revigorar` | → rótulo alt | `tonificante` | *(depreciado)* |
| 627 | `rim` | → rótulo alt | `problemas renais` | *(depreciado)* |
| 628 | `rins` | → rótulo alt | `problemas renais` | *(depreciado)* |
| 629 | `ritual` | manter | `ritual e espiritual` | `active` |
| 630 | `ritualístico` | → rótulo alt | `ritual` | *(depreciado)* |
| 631 | `ronquidão` | → rótulo alt | `rouquidão` | *(depreciado)* |
| 632 | `rouquidão` | manter | `problemas respiratórios` | `active` |
| 633 | `sangramento` | manter | `traumatismos e ferimentos` | `active` |
| 634 | `sangue` | manter | `problemas hematológicos` | `active` |
| 635 | `sapinho` | manter | `problemas digestivos` | `active` |
| 636 | `sarampo` | manter | `doenças infecciosas e parasitárias` | `active` |
| 637 | `sarna` | manter | `doenças infecciosas e parasitárias` | `active` |
| 638 | `saúde` | depreciar → | `medicinal` | *(depreciado)* |
| 639 | `secreção` | → rótulo alt | `catarro` | *(depreciado)* |
| 640 | `sedativo` | manter | `ação farmacológica` | `active` |
| 641 | `sedação` | → rótulo alt | `sedativo` | *(depreciado)* |
| 642 | `seio` | manter | `problemas ginecológicos e obstétricos` | **`candidate`** |
| 643 | `sem uso reportado` | depreciar → | `indeterminado` | *(depreciado)* |
| 644 | `sinusite` | manter | `problemas respiratórios` | `active` |
| 645 | `sistema nervoso` | → rótulo alt | `nervosismo` | *(depreciado)* |
| 646 | `soluço` | manter | `problemas digestivos` | `active` |
| 647 | `sono` | → rótulo alt | `insônia` | *(depreciado)* |
| 648 | `sonífero` | → rótulo alt | `sedativo` | *(depreciado)* |
| 649 | `stomache` | → rótulo alt | `dor no estômago` | *(depreciado)* |
| 650 | `sudorífico` | → rótulo alt | `diaforético` | *(depreciado)* |
| 651 | `suor` | manter | `condições gerais e inespecíficas` | `active` |
| 652 | `suplemento para garrafadas` | depreciar → | `alimentar` | *(depreciado)* |
| 653 | `sustento` | manter sem pai (candidate) | — | **`candidate`** |
| 654 | `swollen` | → rótulo alt | `retenção de líquidos` | *(depreciado)* |
| 655 | `taquicardia` | manter | `problemas do coração` | `active` |
| 656 | `tecnologia` | manter | `material e tecnológico` | `active` |
| 657 | `tecnologia social` | → rótulo alt | `tecnologia` | *(depreciado)* |
| 658 | `tecnológica` | → rótulo alt | `tecnologia` | *(depreciado)* |
| 659 | `tecnológico` | → rótulo alt | `tecnologia` | *(depreciado)* |
| 660 | `tifo` | manter | `doenças infecciosas e parasitárias` | `active` |
| 661 | `to fever` | → rótulo alt | `antitérmico` | *(depreciado)* |
| 662 | `tonificante` | manter | `ação farmacológica` | `active` |
| 663 | `tontura` | manter | `problemas neurológicos e psíquicos` | `active` |
| 664 | `torção` | → rótulo alt | `luxação` | *(depreciado)* |
| 665 | `tosse` | manter | `problemas respiratórios` | `active` |
| 666 | `tosse calmante` | → rótulo alt | `tosse` | *(depreciado)* |
| 667 | `tosse forte` | → rótulo alt | `tosse` | *(depreciado)* |
| 668 | `tosses` | → rótulo alt | `tosse` | *(depreciado)* |
| 669 | `tranquilizante` | → rótulo alt | `sedativo` | *(depreciado)* |
| 670 | `tratamento de fígado e rins` | → rótulo oculto em dois | `problemas do fígado` + `problemas renais` | *(depreciado)* |
| 671 | `tratamento de rins e fígado` | → rótulo oculto em dois | `problemas renais` + `problemas do fígado` | *(depreciado)* |
| 672 | `tratar e curar a asma` | → rótulo alt | `asma` | *(depreciado)* |
| 673 | `trato respiratório` | → rótulo alt | `problemas respiratórios` | *(depreciado)* |
| 674 | `traumatismo` | manter | `traumatismos e ferimentos` | `active` |
| 675 | `triglicerídeos` | manter | `problemas metabólicos e endócrinos` | `active` |
| 676 | `tuberculose` | manter | `problemas respiratórios` | `active` |
| 677 | `tumor` | manter | `neoplasias` | `active` |
| 678 | `tumores` | → rótulo alt | `tumor` | *(depreciado)* |
| 679 | `twists` | → rótulo alt | `luxação` | *(depreciado)* |
| 680 | `tóxico` | manter | `tóxico e defensivo` | `active` |
| 681 | `urina trancada` | manter | `problemas renais` | `active` |
| 682 | `uropatia` | → rótulo alt | `problemas renais` | *(depreciado)* |
| 683 | `urticária` | manter | `doenças de pele` | `active` |
| 684 | `utensílio` | manter | `material e tecnológico` | `active` |
| 685 | `utensílio doméstico` | → rótulo alt | `utensílio` | *(depreciado)* |
| 686 | `utensílios` | → rótulo alt | `utensílio` | *(depreciado)* |
| 687 | `utensílios (colchões com folhas)` | depreciar → | `utensílio` | *(depreciado)* |
| 688 | `utensílios (moenda de cana e mundéu com estipe)` | depreciar → | `utensílio` | *(depreciado)* |
| 689 | `utensílios (móveis como prateleira e estrado de cama com estipe)` | depreciar → | `utensílio` | *(depreciado)* |
| 690 | `utensílios (trançados para caçar peixe com folhas)` | depreciar → | `utensílio` | *(depreciado)* |
| 691 | `uterus, urinary and ovary infection` | → rótulo oculto em dois | `problemas ginecológicos e obstétricos` + `problemas renais` | *(depreciado)* |
| 692 | `varizes` | manter | `problemas circulatórios` | `active` |
| 693 | `veias` | → rótulo alt | `problemas circulatórios` | *(depreciado)* |
| 694 | `velas` | manter | `material e tecnológico` | `active` |
| 695 | `veneno` | manter | `tóxico e defensivo` | `active` |
| 696 | `verme` | manter | `doenças infecciosas e parasitárias` | `active` |
| 697 | `vermes` | → rótulo alt | `verme` | *(depreciado)* |
| 698 | `vermes intestinais` | → rótulo alt | `verme` | *(depreciado)* |
| 699 | `vermicida` | → rótulo alt | `vermífugo` | *(depreciado)* |
| 700 | `verminose` | → rótulo alt | `verme` | *(depreciado)* |
| 701 | `vermífugo` | manter | `ação farmacológica` | `active` |
| 702 | `verrugas` | manter | `doenças de pele` | `active` |
| 703 | `vertigem` | → rótulo alt | `tontura` | *(depreciado)* |
| 704 | `vesícula` | manter | `problemas do fígado` | `active` |
| 705 | `vias urinárias` | → rótulo alt | `problemas renais` | *(depreciado)* |
| 706 | `virose` | manter | `doenças infecciosas e parasitárias` | `active` |
| 707 | `vírus` | → rótulo alt | `virose` | *(depreciado)* |
| 708 | `vômito` | manter | `problemas digestivos` | `active` |
| 709 | `vômitos` | → rótulo alt | `vômito` | *(depreciado)* |
| 710 | `xarope` | manter | `forma de preparo e administração` | `active` |
| 711 | `úlcera` | manter | `problemas digestivos` | `active` |
| 712 | `úlceras` | → rótulo alt | `úlcera` | *(depreciado)* |
| 713 | `útero` | manter | `problemas ginecológicos e obstétricos` | `active` |

## Os 12 termos compostos

| Termo composto | Rótulo oculto em | Depreciado apontando |
|---|---|---|
| `gripe e tosse` | `gripe` + `tosse` | `gripe` |
| `gripe e resfriado` | `gripe` + `resfriado` | `gripe` |
| `asma e tosse` | `asma` + `tosse` | `asma` |
| `dor e inflamação` | `dor` + `inflamação` | `dor` |
| `dor de dente e cabeça` | `dor de dente` + `dor de cabeça` | `dor de dente` |
| `colesterol e diabetes` | `colesterol` + `diabetes` | `colesterol` |
| `fígado e estômago` | `problemas do fígado` + `problemas digestivos` | `problemas do fígado` |
| `estômago e fígado` | `problemas digestivos` + `problemas do fígado` | `problemas digestivos` |
| `fígado e rins` | `problemas do fígado` + `problemas renais` | `problemas do fígado` |
| `tratamento de fígado e rins` | `problemas do fígado` + `problemas renais` | `problemas do fígado` |
| `tratamento de rins e fígado` | `problemas renais` + `problemas do fígado` | `problemas renais` |
| `uterus, urinary and ovary infection` | `problemas ginecológicos e obstétricos` + `problemas renais` | `problemas ginecológicos e obstétricos` |

## Conceitos que mais absorvem termos

| Conceito | Nº | Termos absorvidos |
|---|---:|---|
| `problemas renais` | 15 | `fígado e rins`, `problema de rim`, `problema nos rins`, `problema renal`, `problemas de rins`, `problemas nos rins`, `problemas nos rins e bexiga`, `problemas urinários`, `rim`, `rins`, `tratamento de fígado e rins`, `tratamento de rins e fígado`, `uropatia`, `uterus, urinary and ovary infection`, `vias urinárias` |
| `alimentar` | 11 | `alimentação`, `alimentação (palmito)`, `alimentação (vinho dos frutos)`, `alimentação humana`, `alimento`, `alimentício`, `chá de bebê`, `comida`, `cozinha`, `fome`, `suplemento para garrafadas` |
| `problemas do fígado` | 11 | `estômago e fígado`, `fígado`, `fígado e estômago`, `fígado e rins`, `para o fígado`, `problema no fígado`, `problemas com o fígado`, `problemas de fígado`, `problemas no fígado`, `tratamento de fígado e rins`, `tratamento de rins e fígado` |
| `indeterminado` | 10 | `catuaba`, `corpo`, `doenças`, `dúvida`, `enferrujado`, `não especificado`, `outros`, `peito`, `pernas`, `sem uso reportado` |
| `problemas digestivos` | 10 | `digestão`, `distúrbio intestinal`, `estômago`, `estômago e fígado`, `fígado e estômago`, `indigestion`, `intestino`, `intestinos`, `problemas do estômago`, `problemas estomacais` |
| `pressão alta` | 10 | `baixa a pressão`, `baixar a pressão`, `controlar a pressão arterial`, `high blood pressure`, `hipertensão`, `hipertensão arterial`, `normalizar a pressão`, `pressão`, `regulador da pressão arterial`, `regular a pressão` |
| `cicatrizante` | 7 | `cicatrizar`, `cicatrizar feridas`, `cicatrizar feridas e úlceras`, `cicatrização`, `cicatrização de feridas`, `cicatrizing and muscular relaxant`, `healing` |
| `calmante` | 7 | `acalmar`, `calmante (nervoso)`, `calmante infantil`, `calmante natural`, `calmante para o coração`, `calmante para os nervos`, `relaxar` |
| `dor no estômago` | 7 | `dor de estomago`, `dor de estômago`, `dor no estomago`, `dores de estômago`, `dores estomacais`, `dores no estômago`, `stomache` |
| `inflamação na garganta` | 7 | `garganta inflamada`, `infecção de garganta`, `inflamação da garganta`, `inflamação de garganta`, `inflamações na garganta`, `inflammed throat`, `problemas na garganta` |
| `problemas respiratórios` | 7 | `doenças respiratórias`, `problemas nas vias respiratórias`, `problemas no pulmão`, `problemas pulmonares`, `pulmão`, `respiratório`, `trato respiratório` |
| `tosse` | 7 | `aliviar tosses`, `asma e tosse`, `cough`, `gripe e tosse`, `tosse calmante`, `tosse forte`, `tosses` |
| `menstruação` | 7 | `ausência da menstruação`, `controls the period`, `falta de menstruação`, `menstruação atrasada`, `regulador menstrual`, `regular a menstruação`, `regular menstruação` |
| `utensílio` | 6 | `utensílio doméstico`, `utensílios`, `utensílios (colchões com folhas)`, `utensílios (moenda de cana e mundéu com estipe)`, `utensílios (móveis como prateleira e estrado de cama com estipe)`, `utensílios (trançados para caçar peixe com folhas)` |
| `depurativo` | 6 | `afinar o sangue`, `depurativo do sangue`, `desintoxicar`, `limpar o sangue`, `purificante`, `purificar o sangue` |
| `dor` | 6 | `dor e inflamação`, `dores em geral`, `dores no geral`, `hurts`, `pain`, `qualquer dor` |
| `inflamação` | 6 | `dor e inflamação`, `inflamação em geral`, `inflamação no corpo`, `inflamações`, `inflammation`, `inflações` |
| `doenças de pele` | 6 | `doenças da pele`, `irritação da pele`, `irritação na pele`, `para limpar a pele`, `pele`, `problemas de pele` |
| `útero` | 6 | `caroço no útero`, `dores no útero`, `infecção de útero`, `infecção uterina`, `limpeza do útero`, `limpeza uterina` |
| `anti-inflamatório` | 5 | `anti-inflamatório geral`, `anti-inflammatory`, `antiinflamatório`, `inflamamtion`, `inflamation` |
| `sedativo` | 5 | `as depressant`, `depressant`, `sedação`, `sonífero`, `tranquilizante` |
| `tonificante` | 5 | `dar energia`, `energia`, `reinvigorate and gives energy`, `reinvigorate and gives you energy`, `revigorar` |
| `verme` | 5 | `cólica provocada por vermes`, `intestinal worms`, `vermes`, `vermes intestinais`, `verminose` |
| `gripe` | 5 | `flu`, `gripe e resfriado`, `gripe e tosse`, `gripes`, `prevenir a gripe` |
| `má digestão` | 5 | `dispepsia`, `fazer a digestão`, `indigestão`, `para digestão`, `para fazer a digestão` |
| `pedra nos rins` | 5 | `cálculo renal`, `kidney stone`, `kidney stones`, `pedra no rim`, `pedras nos rins` |
| `insônia` | 5 | `aliviar insônia`, `curar insônia`, `dar sono`, `dormir`, `sono` |
| `contusão` | 5 | `contusões`, `equimoses`, `machucado`, `machucados`, `pancadas` |
| `picada de insetos` | 5 | `picada de abelha`, `picada de aranha`, `picada de mosquito`, `picadas`, `picadas de insetos` |
| `cansaço` | 5 | `cansado`, `esgotamento`, `esgotamento físico`, `fadiga`, `para recuperar do cansaço` |
| `medicinal` | 4 | `manejo de reações adversas`, `medicinal (seiva do palmito jovem para desinfecção, anestésico, coagulação do sangue)`, `possível atividade antitumoral`, `saúde` |
| `dor nas costas` | 4 | `backache`, `dor lombar`, `dor na coluna`, `dor na espinha` |
| `cólica` | 4 | `cramps`, `cólicas`, `cólicas e dores`, `dores e cólicas` |
| `asma` | 4 | `asma brônquica`, `asma e tosse`, `curar a asma`, `tratar e curar a asma` |
| `apetite` | 4 | `abre o apetite`, `abrir o apetite`, `falta de apetite`, `perda de apetite` |
| `retenção de líquidos` | 4 | `edema`, `inchaço`, `inchaço nas pernas`, `swollen` |
| `problemas do coração` | 4 | `coração`, `doença do coração`, `problema no coração`, `problemas no coração` |
| `problemas circulatórios` | 4 | `circulação`, `circulação do sangue`, `má circulação do sangue`, `veias` |
| `derrame` | 4 | `derrames`, `prevent stoke`, `prevent stroke`, `prevenção de derrame` |
| `nervosismo` | 4 | `crises nervosas`, `nervos`, `nervoso`, `sistema nervoso` |
| `luxação` | 4 | `entorses`, `luxações`, `torção`, `twists` |
| `colesterol` | 4 | `baixar o colesterol`, `colesterol alto`, `colesterol e diabetes`, `elimina o colesterol ruim` |
