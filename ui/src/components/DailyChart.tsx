import {AreaBumpSerie, AreaBumpSerieExtraProps, DefaultAreaBumpDatum, ResponsiveBump} from '@nivo/bump'
import {Transaction} from "../types/transaction";
import {Textarea} from "@chakra-ui/react";

interface SeriesData {
    x: string
    y: number
}

interface DailyChartProps {
    txs: Transaction[]
}

export const DailyChart = (props: DailyChartProps) => {

    const daysInMonth = (d: Date) => {
        const m = new Date(d.getFullYear(), d.getMonth()+1, 0);
        return m.getDate();
    }

    const chartData = (txs: Transaction[]) => {
        let data: AreaBumpSerie<DefaultAreaBumpDatum, AreaBumpSerieExtraProps>[];
        let chains: Record<string, AreaBumpSerie<DefaultAreaBumpDatum, AreaBumpSerieExtraProps>>;
        let seriesByChain: Record<string, Record<string, DefaultAreaBumpDatum>>;
        const month = txs[0];
        const numDays = daysInMonth(new Date(month.time));

        data = [];
        chains = {};
        seriesByChain = {};

        const emptyDays: SeriesData[]  = [];
        for(let i=0; i < numDays; i++) {
            emptyDays[i] = { x: (i+1).toString(), y: 0 }
        }

        props.txs.map((tx, i, txs) => {
            if(chains[tx.chain_id] === undefined) {
                chains[tx.chain_id] = {
                    id: tx.chain_id,
                    data: emptyDays
                }
            }

            const txDay = new Date(tx.time).getDay();
            if(seriesByChain[tx.chain_id] === undefined) {
                seriesByChain[tx.chain_id] = {};
            }
            if(seriesByChain[tx.chain_id][txDay] === undefined) {
                seriesByChain[tx.chain_id][txDay] = {
                    x: txDay.toString(),
                    y: 0
                } as SeriesData;
            }
            console.log(tx.chain_id, seriesByChain[tx.chain_id]);
            seriesByChain[tx.chain_id][txDay].y += tx.num_relays;
            return chains;
        });

        Object.entries(chains).map(([chainId, chainSeries], n) => {
            const dat = seriesByChain[chainId];
            const formattedValues: SeriesData[] = emptyDays
            Object.entries(dat).map((v, i) => {
                const [date, values] = v
                formattedValues[parseInt(date) - 1] = dat[date];
                return values;
            })
            data.push({
                id: chainId,
                data: formattedValues
            })
        });

        console.log(data);
        return data;
    }


    return (
        <>
            <ResponsiveBump
                data={chartData(props.txs)}
                // colors={{ scheme: 'spectral' }}
                lineWidth={3}
                activeLineWidth={6}
                inactiveLineWidth={3}
                inactiveOpacity={0.15}
                pointSize={10}
                activePointSize={16}
                inactivePointSize={0}
                endLabel={true}
                enableGridX={false}
                enableGridY={true}
                // pointColor={{ theme: 'background' }}
                pointBorderWidth={3}
                activePointBorderWidth={3}
                // pointBorderColor={{ from: 'serie.color' }}
                axisTop={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'date',
                    legendPosition: 'middle',
                    legendOffset: 32
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'relays',
                    legendPosition: 'middle',
                    legendOffset: -40
                }}
                margin={{ top: 40, right: 100, bottom: 40, left: 60 }}
                axisRight={null}
            />
            <Textarea rows={10}>
                {JSON.stringify(chartData(props.txs), null, 2)}
            </Textarea>
        </>
    )
}