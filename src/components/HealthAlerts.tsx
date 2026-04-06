import { IconActivity, IconScale, IconRuler, IconPercent, IconTrendingUp } from './Icons'

interface MetricData {
  weight_kg: number | null
  body_fat_pct: number | null
  waist_cm: number | null
  hip_cm: number | null
  chest_cm: number | null
}

interface ProfileData {
  height_cm: number | null
  sex: string | null
  age: number | null
}

interface Alert {
  id: string
  severity: 'info' | 'warning' | 'danger'
  title: string
  message: string
  icon: React.ReactNode
  detail?: string
}

interface HealthAlertsProps {
  latestMetrics: MetricData | null
  previousMetrics: MetricData | null
  profile: ProfileData | null
}

export default function HealthAlerts({ latestMetrics, previousMetrics, profile }: HealthAlertsProps) {
  if (!latestMetrics) return null

  const alerts: Alert[] = []
  const heightM = profile?.height_cm ? profile.height_cm / 100 : null
  const sex = profile?.sex || null

  // 1. BMI Analysis
  if (latestMetrics.weight_kg && heightM) {
    const bmi = latestMetrics.weight_kg / (heightM * heightM)

    if (bmi < 16) {
      alerts.push({
        id: 'bmi-severe-underweight',
        severity: 'danger',
        title: 'IMC muito baixo',
        message: `Seu IMC é ${bmi.toFixed(1)} — classificado como magreza severa.`,
        icon: <IconActivity size={18} />,
        detail: 'IMC abaixo de 16 está associado a desnutrição e risco elevado de complicações. Procure orientação médica e nutricional.',
      })
    } else if (bmi < 17) {
      alerts.push({
        id: 'bmi-underweight-moderate',
        severity: 'warning',
        title: 'IMC abaixo do ideal',
        message: `Seu IMC é ${bmi.toFixed(1)} — classificado como magreza moderada.`,
        icon: <IconActivity size={18} />,
        detail: 'Considere consultar um nutricionista para avaliar se há necessidade de ajuste na alimentação.',
      })
    } else if (bmi >= 30 && bmi < 35) {
      alerts.push({
        id: 'bmi-obese-1',
        severity: 'warning',
        title: 'IMC indica obesidade grau I',
        message: `Seu IMC é ${bmi.toFixed(1)} — acima de 30.`,
        icon: <IconActivity size={18} />,
        detail: 'Obesidade grau I está associada a maior risco de diabetes tipo 2, hipertensão e doenças cardiovasculares. Exercícios regulares e acompanhamento nutricional são recomendados.',
      })
    } else if (bmi >= 35 && bmi < 40) {
      alerts.push({
        id: 'bmi-obese-2',
        severity: 'danger',
        title: 'IMC indica obesidade grau II',
        message: `Seu IMC é ${bmi.toFixed(1)} — classificado como obesidade severa.`,
        icon: <IconActivity size={18} />,
        detail: 'Risco significativamente elevado de complicações metabólicas. Recomenda-se acompanhamento médico, nutricional e programa de exercícios supervisionado.',
      })
    } else if (bmi >= 40) {
      alerts.push({
        id: 'bmi-obese-3',
        severity: 'danger',
        title: 'IMC indica obesidade grau III',
        message: `Seu IMC é ${bmi.toFixed(1)} — classificado como obesidade mórbida.`,
        icon: <IconActivity size={18} />,
        detail: 'Risco muito elevado de doenças graves. Procure acompanhamento médico multidisciplinar urgente.',
      })
    } else if (bmi >= 25 && bmi < 30) {
      alerts.push({
        id: 'bmi-overweight',
        severity: 'info',
        title: 'IMC indica sobrepeso',
        message: `Seu IMC é ${bmi.toFixed(1)} — entre 25 e 30.`,
        icon: <IconActivity size={18} />,
        detail: 'Embora o IMC não diferencie massa muscular de gordura, valores nesta faixa merecem atenção. Avalie junto com outras medidas como circunferência da cintura e % de gordura.',
      })
    }
  }

  // 2. Waist Circumference (Metabolic risk)
  if (latestMetrics.waist_cm) {
    const waist = latestMetrics.waist_cm

    if (sex === 'M') {
      if (waist >= 102) {
        alerts.push({
          id: 'waist-high-risk-m',
          severity: 'danger',
          title: 'Cintura com risco elevado',
          message: `Circunferência da cintura: ${waist} cm (limite: 102 cm para homens).`,
          icon: <IconRuler size={18} />,
          detail: 'Cintura acima de 102 cm em homens indica acúmulo de gordura visceral e está fortemente associada a resistência à insulina, diabetes tipo 2, hipertensão e doenças cardiovasculares.',
        })
      } else if (waist >= 94) {
        alerts.push({
          id: 'waist-moderate-risk-m',
          severity: 'warning',
          title: 'Cintura em risco moderado',
          message: `Circunferência da cintura: ${waist} cm (alerta a partir de 94 cm para homens).`,
          icon: <IconRuler size={18} />,
          detail: 'Valores entre 94–102 cm indicam risco moderado de complicações metabólicas. Fique atento à alimentação e mantenha atividade física regular.',
        })
      }
    } else if (sex === 'F') {
      if (waist >= 88) {
        alerts.push({
          id: 'waist-high-risk-f',
          severity: 'danger',
          title: 'Cintura com risco elevado',
          message: `Circunferência da cintura: ${waist} cm (limite: 88 cm para mulheres).`,
          icon: <IconRuler size={18} />,
          detail: 'Cintura acima de 88 cm em mulheres indica acúmulo significativo de gordura visceral, aumentando risco de síndrome metabólica e doenças cardiovasculares.',
        })
      } else if (waist >= 80) {
        alerts.push({
          id: 'waist-moderate-risk-f',
          severity: 'warning',
          title: 'Cintura em risco moderado',
          message: `Circunferência da cintura: ${waist} cm (alerta a partir de 80 cm para mulheres).`,
          icon: <IconRuler size={18} />,
          detail: 'Valores entre 80–88 cm indicam risco moderado. Atividade física e alimentação equilibrada ajudam a reduzir a gordura abdominal.',
        })
      }
    } else {
      // Sex not specified — use general thresholds
      if (waist >= 102) {
        alerts.push({
          id: 'waist-high-general',
          severity: 'danger',
          title: 'Cintura com risco elevado',
          message: `Circunferência da cintura: ${waist} cm.`,
          icon: <IconRuler size={18} />,
          detail: 'Valores elevados de circunferência da cintura estão associados a maior risco metabólico. Configure seu sexo no perfil para alertas mais precisos.',
        })
      } else if (waist >= 88) {
        alerts.push({
          id: 'waist-moderate-general',
          severity: 'warning',
          title: 'Cintura em atenção',
          message: `Circunferência da cintura: ${waist} cm.`,
          icon: <IconRuler size={18} />,
          detail: 'Configure seu sexo no perfil para receber alertas com limiares personalizados.',
        })
      }
    }
  }

  // 3. Waist-to-Hip Ratio
  if (latestMetrics.waist_cm && latestMetrics.hip_cm) {
    const whr = latestMetrics.waist_cm / latestMetrics.hip_cm

    if (sex === 'M' && whr >= 0.95) {
      alerts.push({
        id: 'whr-high-m',
        severity: 'warning',
        title: 'Relação cintura/quadril elevada',
        message: `RCQ: ${whr.toFixed(2)} (ideal para homens: < 0,90).`,
        icon: <IconScale size={18} />,
        detail: 'A relação cintura/quadril é um indicador de distribuição de gordura corporal. Valores elevados sugerem maior acúmulo de gordura abdominal e risco cardiovascular aumentado.',
      })
    } else if (sex === 'F' && whr >= 0.85) {
      alerts.push({
        id: 'whr-high-f',
        severity: 'warning',
        title: 'Relação cintura/quadril elevada',
        message: `RCQ: ${whr.toFixed(2)} (ideal para mulheres: < 0,85).`,
        icon: <IconScale size={18} />,
        detail: 'Valores acima de 0,85 para mulheres indicam padrão de distribuição de gordura associado a maior risco de doenças metabólicas.',
      })
    }
  }

  // 4. Body Fat Percentage
  if (latestMetrics.body_fat_pct) {
    const fat = latestMetrics.body_fat_pct

    if (sex === 'M') {
      if (fat >= 25) {
        alerts.push({
          id: 'fat-high-m',
          severity: fat >= 30 ? 'danger' : 'warning',
          title: fat >= 30 ? 'Gordura corporal muito alta' : 'Gordura corporal elevada',
          message: `Gordura corporal: ${fat}% (ideal para homens: 10–20%).`,
          icon: <IconPercent size={18} />,
          detail: fat >= 30
            ? 'Percentual de gordura acima de 30% em homens é classificado como obesidade e aumenta significativamente o risco de doenças crônicas.'
            : 'Percentual acima de 25% em homens indica excesso de gordura. Combinação de treino de força e ajuste alimentar pode ajudar.',
        })
      } else if (fat < 5) {
        alerts.push({
          id: 'fat-low-m',
          severity: 'danger',
          title: 'Gordura corporal perigosamente baixa',
          message: `Gordura corporal: ${fat}% (mínimo essencial: ~5% para homens).`,
          icon: <IconPercent size={18} />,
          detail: 'Níveis muito baixos de gordura corporal podem causar problemas hormonais, imunológicos e metabólicos. Procure orientação médica.',
        })
      }
    } else if (sex === 'F') {
      if (fat >= 32) {
        alerts.push({
          id: 'fat-high-f',
          severity: fat >= 38 ? 'danger' : 'warning',
          title: fat >= 38 ? 'Gordura corporal muito alta' : 'Gordura corporal elevada',
          message: `Gordura corporal: ${fat}% (ideal para mulheres: 18–28%).`,
          icon: <IconPercent size={18} />,
          detail: fat >= 38
            ? 'Percentual acima de 38% em mulheres é classificado como obesidade e requer atenção médica.'
            : 'Percentual acima de 32% indica excesso. Exercícios regulares e alimentação equilibrada são recomendados.',
        })
      } else if (fat < 12) {
        alerts.push({
          id: 'fat-low-f',
          severity: 'danger',
          title: 'Gordura corporal perigosamente baixa',
          message: `Gordura corporal: ${fat}% (mínimo essencial: ~12% para mulheres).`,
          icon: <IconPercent size={18} />,
          detail: 'Gordura corporal muito baixa em mulheres pode causar amenorreia, osteoporose e distúrbios hormonais graves.',
        })
      }
    }
  }

  // 5. Rapid Weight Changes
  if (latestMetrics.weight_kg && previousMetrics?.weight_kg) {
    const diff = latestMetrics.weight_kg - previousMetrics.weight_kg
    const pctChange = Math.abs(diff / previousMetrics.weight_kg) * 100

    if (pctChange >= 5) {
      alerts.push({
        id: 'rapid-weight-change',
        severity: 'danger',
        title: diff > 0 ? 'Ganho de peso rápido detectado' : 'Perda de peso rápida detectada',
        message: `Variação de ${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg (${pctChange.toFixed(1)}%) desde a última medição.`,
        icon: <IconTrendingUp size={18} />,
        detail: diff > 0
          ? 'Ganho de peso superior a 5% em curto período pode indicar retenção hídrica, problemas hormonais ou alterações metabólicas. Se persistir, consulte um médico.'
          : 'Perda de peso superior a 5% sem causa aparente pode indicar problemas de saúde. Descarte causas como dietas muito restritivas e, se não intencional, procure avaliação médica.',
      })
    } else if (pctChange >= 3) {
      alerts.push({
        id: 'weight-change-attention',
        severity: 'info',
        title: diff > 0 ? 'Ganho de peso significativo' : 'Perda de peso significativa',
        message: `Variação de ${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg (${pctChange.toFixed(1)}%) desde a última medição.`,
        icon: <IconTrendingUp size={18} />,
        detail: 'Variações entre 3–5% merecem atenção. Monitore se é uma tendência consistente ou flutuação pontual.',
      })
    }
  }

  // 6. Missing height/sex config warning
  if (!profile?.height_cm || !profile?.sex) {
    const missing: string[] = []
    if (!profile?.height_cm) missing.push('altura')
    if (!profile?.sex) missing.push('sexo')
    alerts.push({
      id: 'profile-incomplete',
      severity: 'info',
      title: 'Perfil incompleto',
      message: `Configure ${missing.join(' e ')} no perfil para alertas mais precisos.`,
      icon: <IconActivity size={18} />,
      detail: 'Alguns alertas de saúde dependem dessas informações para calcular limiares personalizados (IMC, circunferência da cintura, gordura corporal).',
    })
  }

  if (alerts.length === 0) return null

  const severityOrder = { danger: 0, warning: 1, info: 2 }
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  const severityStyles = {
    danger: {
      border: '1px solid rgba(239, 68, 68, 0.3)',
      background: 'rgba(239, 68, 68, 0.06)',
      accentColor: 'var(--accent-danger)',
      iconBg: 'rgba(239, 68, 68, 0.15)',
    },
    warning: {
      border: '1px solid rgba(245, 158, 11, 0.3)',
      background: 'rgba(245, 158, 11, 0.06)',
      accentColor: 'var(--accent-warning)',
      iconBg: 'rgba(245, 158, 11, 0.15)',
    },
    info: {
      border: '1px solid rgba(59, 130, 246, 0.3)',
      background: 'rgba(59, 130, 246, 0.06)',
      accentColor: 'var(--accent-secondary)',
      iconBg: 'rgba(59, 130, 246, 0.15)',
    },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
      <h3 style={{
        fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.04em', color: 'var(--text-secondary)',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <IconActivity size={16} /> Alertas de Saúde
        <span style={{
          fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--radius-full)',
          background: alerts.some(a => a.severity === 'danger')
            ? 'rgba(239, 68, 68, 0.15)'
            : alerts.some(a => a.severity === 'warning')
            ? 'rgba(245, 158, 11, 0.15)'
            : 'rgba(59, 130, 246, 0.15)',
          color: alerts.some(a => a.severity === 'danger')
            ? 'var(--accent-danger)'
            : alerts.some(a => a.severity === 'warning')
            ? 'var(--accent-warning)'
            : 'var(--accent-secondary)',
          fontWeight: 600,
        }}>
          {alerts.length}
        </span>
      </h3>

      {alerts.map(alert => {
        const style = severityStyles[alert.severity]
        return (
          <div key={alert.id} style={{
            border: style.border,
            background: style.background,
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
            transition: 'all var(--transition-fast)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              background: style.iconBg, color: style.accentColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {alert.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 700, fontSize: '0.9rem', color: style.accentColor,
                marginBottom: 4
              }}>
                {alert.title}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {alert.message}
              </div>
              {alert.detail && (
                <div style={{
                  fontSize: '0.8rem', color: 'var(--text-tertiary)', lineHeight: 1.5,
                  marginTop: 8, padding: '10px 12px',
                  background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--radius-sm)',
                }}>
                  {alert.detail}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
