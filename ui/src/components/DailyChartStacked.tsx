import {Transaction} from "../types/transaction";
import {Box, Textarea, VStack} from "@chakra-ui/react";
import {useContext} from "react";
import {NodeContext} from "../context";
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface DailyChartProps {
    txs: Transaction[]
}

interface dataset {
    label: string
    backgroundColor: string
    data: number[]
}

export const DailyChartStacked = (props: DailyChartProps) => {

    const node = useContext(NodeContext);

    const daysInMonth = (d: Date) => {
        const m = new Date(d.getFullYear(), d.getMonth()+1, 0);
        return m.getDate();
    }

    const options = {
        plugins: {
            title: {
                display: true,
                text: 'Daily rewards by relay chain',
            },
        },
        responsive: true,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            },
        }
    };

    const chartData = (txs: Transaction[]) => {
        const month = txs[0];
        const numDays = daysInMonth(new Date(month.time));
        const labels: string[] = [];
        for(let i=1; i <= numDays; i++) {
            labels.push(i.toString());
        }


        const defaultDatasets: dataset[] = []
        const data = {
            labels: labels,
            datasets: defaultDatasets,
        }

        const chains: Record<string, number[]> = {};
        props.txs.map((tx, i, txs) => {
            const dayValues: number[] = [];
            for(let i = 1; i <= numDays; i++) {
                dayValues.push(0);
            }
            const txDay = (new Date(tx.time)).getDate();
            if(chains[tx.chain.name] === undefined) {
                chains[tx.chain.name] = dayValues;
            }

            chains[tx.chain.name][txDay] += tx.num_relays;
        });

        const shuffle = (array: Array<any>) => {
            let currentIndex = array.length,  randomIndex;

            while (currentIndex != 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;

                [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
            }

            return array;
        }

        let colors = ['#daedfe', '#4a8cff', '#003ba3', '#6f2dbd', '#fb7742', '#6cb54d', '#ff6ec3'];
        Object.entries(chains).map(([chain, values], i) => {
            colors = shuffle(colors);
            data.datasets.push({
                label: chain,
                data: values,
                backgroundColor: colors.pop() ?? '',
            })
        })

        return data;
    }

    return (
        <Box width={'800px'} height={'400px'} margin={"auto"}>
            <Bar
                data={chartData(props.txs)}
                options={options}
             />
        </Box>
    )
}