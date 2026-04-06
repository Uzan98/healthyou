import { useState } from 'react'
import { IconChevronRight, IconRuler } from './Icons'

interface GuideItem {
  id: string
  title: string
  location: string
  instructions: string[]
  tips: string[]
}

const guideData: GuideItem[] = [
  {
    id: 'peso',
    title: 'Peso Corporal',
    location: 'Balança digital',
    instructions: [
      'Pese-se sempre no mesmo horário, preferencialmente ao acordar.',
      'Vá ao banheiro antes de se pesar.',
      'Use o mínimo de roupa possível (ou sempre a mesma).',
      'Posicione a balança em superfície plana e firme (nunca sobre tapete).',
      'Fique parado com os pés paralelos e centralizados na balança.',
      'Distribua o peso igualmente entre os dois pés.',
    ],
    tips: [
      'Oscilações de 0,5–1,5 kg entre dias são normais (retenção hídrica, alimentação).',
      'Avalie a tendência semanal/mensal, não o valor diário.',
      'Evite se pesar após refeições pesadas ou treinos intensos.',
    ],
  },
  {
    id: 'gordura',
    title: 'Percentual de Gordura',
    location: 'Adipômetro ou balança bioimpedância',
    instructions: [
      'Se usar balança de bioimpedância, siga as mesmas regras do peso.',
      'Esteja bem hidratado, mas não logo após beber grande quantidade de água.',
      'Se usar adipômetro, procure um profissional para as primeiras medições.',
      'Meça sempre nos mesmos pontos anatômicos a cada avaliação.',
    ],
    tips: [
      'Balanças de bioimpedância são imprecisas em valor absoluto, mas úteis para acompanhar tendências.',
      'O ideal é medir com adipômetro (plicômetro) feito por profissional.',
      'Não compare valores entre equipamentos diferentes.',
    ],
  },
  {
    id: 'peito',
    title: 'Circunferência do Peito',
    location: 'Na altura dos mamilos',
    instructions: [
      'Fique em pé, com postura ereta e braços relaxados ao lado do corpo.',
      'Posicione a fita métrica ao redor do tronco, na altura dos mamilos.',
      'A fita deve ficar horizontal, paralela ao chão.',
      'Não estique ou flexione o peitoral durante a medição.',
      'Meça ao final de uma expiração normal (sem forçar).',
    ],
    tips: [
      'Peça ajuda para posicionar a fita nas costas.',
      'A fita deve estar justa, mas sem apertar a pele.',
    ],
  },
  {
    id: 'cintura',
    title: 'Circunferência da Cintura',
    location: 'Na menor circunferência do tronco (acima do umbigo)',
    instructions: [
      'Fique em pé, com abdômen relaxado (não "chupe a barriga").',
      'Localize o ponto mais estreito do tronco, geralmente entre a última costela e a crista ilíaca.',
      'Se não encontrar o ponto mais estreito, meça na altura do umbigo.',
      'Passe a fita ao redor, mantendo-a horizontal.',
      'Meça ao final de uma expiração normal.',
    ],
    tips: [
      'A medida da cintura é um dos melhores indicadores de saúde metabólica.',
      'Para homens: acima de 94 cm indica risco moderado; acima de 102 cm, risco elevado.',
      'Para mulheres: acima de 80 cm indica risco moderado; acima de 88 cm, risco elevado.',
    ],
  },
  {
    id: 'quadril',
    title: 'Circunferência do Quadril',
    location: 'No ponto mais largo dos glúteos',
    instructions: [
      'Fique em pé, com os pés juntos.',
      'Localize o ponto mais proeminente dos glúteos (visão lateral).',
      'Passe a fita ao redor, mantendo-a horizontal.',
      'Não contraia os glúteos durante a medição.',
    ],
    tips: [
      'A relação cintura/quadril (RCQ) é um indicador de saúde importante.',
      'RCQ ideal: < 0,90 para homens e < 0,85 para mulheres.',
    ],
  },
  {
    id: 'biceps',
    title: 'Circunferência do Bíceps',
    location: 'No ponto mais largo do braço (relaxado)',
    instructions: [
      'Fique em pé com o braço relaxado e estendido ao lado do corpo.',
      'Localize o ponto mais volumoso do bíceps (meia distância entre ombro e cotovelo).',
      'Passe a fita ao redor, perpendicular ao eixo do braço.',
      'Meça com o braço relaxado — a menos que queira medir contraído (neste caso, anote separado).',
      'Meça ambos os lados (esquerdo e direito).',
    ],
    tips: [
      'Diferenças de 0,5–1 cm entre os lados são normais.',
      'Mantenha sempre o mesmo padrão: braço relaxado ou contraído.',
    ],
  },
  {
    id: 'coxa',
    title: 'Circunferência da Coxa',
    location: 'No ponto mais largo, abaixo da virilha',
    instructions: [
      'Fique em pé, com o peso distribuído igualmente entre as pernas.',
      'Localize o ponto mais volumoso da coxa (geralmente 10–15 cm abaixo da virilha).',
      'Passe a fita ao redor, perpendicular ao eixo da perna.',
      'Não contraia os músculos durante a medição.',
      'Meça ambos os lados.',
    ],
    tips: [
      'Use sempre o mesmo ponto de referência. Marcar com caneta pode ajudar na consistência.',
      'Meça na mesma posição (em pé, peso distribuído).',
    ],
  },
  {
    id: 'panturrilha',
    title: 'Circunferência da Panturrilha',
    location: 'No ponto mais largo da "batata da perna"',
    instructions: [
      'Fique em pé com o peso distribuído.',
      'Localize o ponto mais volumoso da panturrilha.',
      'Passe a fita ao redor, perpendicular ao eixo da perna.',
      'Não fique na ponta dos pés.',
      'Meça ambos os lados.',
    ],
    tips: [
      'A panturrilha é um dos músculos mais difíceis de desenvolver.',
      'Variações de volume ao longo do dia são comuns (inchaço por gravidade).',
    ],
  },
]

const generalTips = [
  'Use sempre a mesma fita métrica (de costura, flexível e inextensível).',
  'Meça sempre no mesmo horário do dia para consistência.',
  'Tire as medidas antes de treinar (o treino causa inchaço temporário).',
  'A fita deve estar justa à pele, sem comprimir o tecido.',
  'Faça 2–3 medições do mesmo local e use a média.',
  'Registre as medidas imediatamente para não esquecer.',
  'Tire fotos para comparação visual junto com as medidas.',
  'Avalie a cada 2–4 semanas. Medir diariamente gera ansiedade desnecessária.',
]

export default function MeasurementGuide() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* General tips card */}
      <div className="card" style={{ borderLeft: '3px solid var(--accent-primary)' }}>
        <h3 className="card-title" style={{ marginBottom: 16 }}>
          <IconRuler size={18} /> Dicas Gerais para Medições Precisas
        </h3>
        <ul style={{
          listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10,
          padding: 0, margin: 0
        }}>
          {generalTips.map((tip, i) => (
            <li key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 'var(--radius-full)',
                background: 'var(--accent-primary-dim)', color: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, marginTop: 1
              }}>
                {i + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Individual measurement guides */}
      <h3 style={{
        fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)',
        marginTop: 8, display: 'flex', alignItems: 'center', gap: 8
      }}>
        Guia por Medida
      </h3>

      {guideData.map(item => {
        const isOpen = expandedId === item.id
        return (
          <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <button
              onClick={() => toggle(item.id)}
              style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '18px 24px', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: 12, color: 'var(--text-primary)',
                fontFamily: 'var(--font-family)', fontSize: '0.95rem', fontWeight: 600,
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  width: 36, height: 36, borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-primary-dim)', color: 'var(--accent-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 700, flexShrink: 0
                }}>
                  <IconRuler size={16} />
                </span>
                <div style={{ textAlign: 'left' }}>
                  <div>{item.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 400, marginTop: 2 }}>
                    {item.location}
                  </div>
                </div>
              </div>
              <span style={{
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
                transition: 'transform var(--transition-fast)',
                display: 'flex', color: 'var(--text-tertiary)'
              }}>
                <IconChevronRight size={18} />
              </span>
            </button>

            {isOpen && (
              <div style={{
                padding: '0 24px 20px', borderTop: '1px solid var(--border-color)',
                animation: 'slideUp 0.2s ease'
              }}>
                <div style={{ marginTop: 16 }}>
                  <h4 style={{
                    fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.04em', color: 'var(--accent-primary)', marginBottom: 10
                  }}>
                    Como medir
                  </h4>
                  <ol style={{
                    listStyle: 'none', padding: 0, margin: 0,
                    display: 'flex', flexDirection: 'column', gap: 8
                  }}>
                    {item.instructions.map((inst, i) => (
                      <li key={i} style={{
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                        fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5
                      }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-secondary)', color: 'var(--text-tertiary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 600, flexShrink: 0, marginTop: 2,
                          border: '1px solid var(--border-color)'
                        }}>
                          {i + 1}
                        </span>
                        {inst}
                      </li>
                    ))}
                  </ol>
                </div>

                <div style={{ marginTop: 16 }}>
                  <h4 style={{
                    fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.04em', color: 'var(--accent-warning)', marginBottom: 10
                  }}>
                    Dicas importantes
                  </h4>
                  <ul style={{
                    listStyle: 'none', padding: 0, margin: 0,
                    display: 'flex', flexDirection: 'column', gap: 6
                  }}>
                    {item.tips.map((tip, i) => (
                      <li key={i} style={{
                        display: 'flex', gap: 8, alignItems: 'flex-start',
                        fontSize: '0.83rem', color: 'var(--text-tertiary)', lineHeight: 1.5,
                        padding: '6px 10px', background: 'rgba(245, 158, 11, 0.06)',
                        borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.1)'
                      }}>
                        <span style={{ color: 'var(--accent-warning)', fontWeight: 600, flexShrink: 0 }}>→</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
