import {ResponsiveBar, Bar} from "@nivo/bar";
import {Box, useBreakpointValue} from "@chakra-ui/react";

type DayOfWeekChartProps = {
    data: any[]
    width?: number
    height?: number
}

export const DayOfWeekChart = (props: DayOfWeekChartProps) => {
    const margin = useBreakpointValue([{ top: 0, right: 80, bottom: 80, left: 80 }, {top: 40, right:180, bottom:80, left: 80}]);
    // const isMobile = useBreakpointValue([true, false]);
    // const legendItemWidth = useBreakpointValue([70, 90]) ?? 90

    console.log("bar", props.data);

    return (
        <Box height={`${props.height ?? 400}`}>
            <ResponsiveBar
                data={props.data}
                theme={{tooltip: { container: { color: "#999" }}}}
                margin={margin}
                borderWidth={1}
                borderColor={'#ccc'}
            />
        </Box>
    )
}