'use client'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    LabelList,
    ResponsiveContainer,
} from 'recharts';
import { Props as LabelProps } from 'recharts/types/component/Label';

const renderCustomizedLabel = (props: LabelProps) => {
    const { x, y, width, value } = props

    return value === 0 ? null : (
        <g>
            <text
                x={Number(x) + Number(width) / 2}
                y={Number(y) - 10}
                fill="#2570EA"
                textAnchor="middle"
                dominantBaseline="middle">
                {value}
            </text>
        </g>
    )
}

export default function SnowForecast({ data }: { data: any }) {
    return (
        <ResponsiveContainer width="100%" height={800}>
            <BarChart
                data={data}
                margin={{
                    top: 50,
                    right: 0,
                    left: 0,
                    bottom: 20,
                }}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="inches" fill="#2570EA" minPointSize={5}>
                    <LabelList dataKey="inches" content={renderCustomizedLabel} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}