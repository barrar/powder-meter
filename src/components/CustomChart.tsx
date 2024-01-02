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

const renderCustomizedLabel = (props: LabelProps) => props.value === 0 ? null : (
    <g>
        <text
            x={Number(props.x) + Number(props.width) / 2}
            y={Number(props.y) - 10}
            fill="#2570EA"
            textAnchor="middle"
            dominantBaseline="middle">
            {props.value}
        </text>
    </g>
)


export default function CustomChart({ data }: { data: any }) {
    return (
        <ResponsiveContainer width="100%" height={800}>
            <BarChart
                data={data}
                margin={{
                    top: 20,
                    right: 20,
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