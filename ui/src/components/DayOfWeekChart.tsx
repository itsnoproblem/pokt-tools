import {ResponsiveBar} from "@nivo/bar";
import {Box, useBreakpointValue, useColorModeValue} from "@chakra-ui/react";

type DayOfWeekChartProps = {
    data: any[]
    width?: number
    height?: number
}

export const DayOfWeekChart = (props: DayOfWeekChartProps) => {
    const margin = useBreakpointValue([{ top: 0, right: 80, bottom: 80, left: 80 }, {top: 40, right:180, bottom:80, left: 80}]);
    const chartTextColor = useColorModeValue("#333", "#CCC");
    const chartLabelColor = useColorModeValue("#333", "#333");

    return (
        <Box height={`${props.height ?? 400}`}>
            <ResponsiveBar
                data={props.data}
                theme={{textColor: chartTextColor, tooltip: { container: { color: "#333" }}}}
                margin={margin}
                borderWidth={1}
                borderColor={'#ccc'}
                colorBy={"id"}
                colors={{scheme: "paired"}}
                labelTextColor={chartLabelColor}
            />
        </Box>
    )
}