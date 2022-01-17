import {ResponsivePie} from "@nivo/pie";
import {useBreakpointValue} from "@chakra-ui/react";

type PieChartProps = {
    data: any[]
}

export const PieChart = (props: PieChartProps) => {
    const margin = useBreakpointValue([{ top: 0, right: 80, bottom: 80, left: 80 }, {top: 40, right:180, bottom:80, left: 0}]);
    const isMobile = useBreakpointValue([true, false]);

    return (
        <ResponsivePie
            data={props.data}
            theme={{tooltip: { container: { color: "#999" }}}}
            margin={margin}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={'#ccc'}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#ccc"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={"#ccc"}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={"#000"}
            legends={[
                {
                    anchor: isMobile ? 'bottom' : 'left',
                    direction: 'column',
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 8,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: '#ccc',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: 'circle',
                }
            ]}
        />
    )
}