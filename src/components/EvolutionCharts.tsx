import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import type { DailyPoint, AccuracyPoint } from '../lib/stats'
import { Card } from './ui'

const GRID_COLOR = '#263252'
const AXIS_COLOR = '#9aa5c0'
const TOOLTIP_STYLE = {
  background: '#1a2338',
  border: '1px solid #263252',
  borderRadius: 10,
  fontSize: 12,
  color: '#e7ebf5',
}

export function MinutesChart({ data }: { data: DailyPoint[] }) {
  const hasData = data.some((d) => d.minutes > 0)
  return (
    <Card>
      <h2 className="text-sm font-semibold mb-1">⏱️ Minutos estudados (últimos {data.length} dias)</h2>
      {!hasData ? (
        <p className="text-sm text-[var(--color-text-dim)] py-8 text-center">
          Ainda não há estudos registrados neste período.
        </p>
      ) : (
        <div className="h-48 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="label" stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} width={32} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ color: '#e7ebf5' }}
                formatter={((value: any) => [`${value} min`, 'Estudado']) as any}
              />
              <Bar dataKey="minutes" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}

export function AccuracyChart({ data }: { data: AccuracyPoint[] }) {
  const hasData = data.some((d) => d.accuracy !== null)
  return (
    <Card>
      <h2 className="text-sm font-semibold mb-1">📈 Evolução da taxa de acerto (por semana)</h2>
      {!hasData ? (
        <p className="text-sm text-[var(--color-text-dim)] py-8 text-center">
          Registre questões em pelo menos duas semanas para ver sua evolução aqui.
        </p>
      ) : (
        <div className="h-48 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="label" stroke={AXIS_COLOR} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke={AXIS_COLOR}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={32}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                labelStyle={{ color: '#e7ebf5' }}
                formatter={
                  ((value: any, _name: any, ctx: any) =>
                    ctx?.payload?.total > 0
                      ? [`${value}% (${ctx.payload.total} questões)`, 'Acerto']
                      : ['—', 'Acerto']) as any
                }
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3, fill: '#8b5cf6' }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}
