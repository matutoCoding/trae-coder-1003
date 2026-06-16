import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';
import type { EChartsOption } from 'echarts';

interface LineChartProps {
  title: string;
  xData: string[];
  seriesData: {
    name: string;
    data: number[];
    color: string;
    areaColor?: string;
  }[];
  yAxisName?: string;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  title,
  xData,
  seriesData,
  yAxisName,
  height = 320,
}) => {
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(253, 252, 249, 0.95)',
      borderColor: '#b3cda6',
      borderWidth: 1,
      textStyle: {
        color: '#24471f',
      },
      axisPointer: {
        lineStyle: {
          color: '#86b374',
          type: 'dashed',
        },
      },
    },
    legend: {
      data: seriesData.map((s) => s.name),
      bottom: 0,
      textStyle: {
        color: '#5e440f',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData,
      axisLine: {
        lineStyle: {
          color: '#d1c5ab',
        },
      },
      axisLabel: {
        color: '#5e440f',
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
      nameTextStyle: {
        color: '#5e440f',
        fontSize: 11,
      },
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#5e440f',
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: '#ece6d8',
          type: 'dashed',
        },
      },
    },
    series: seriesData.map((series) => ({
      name: series.name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: series.data,
      lineStyle: {
        width: 3,
        color: series.color,
      },
      itemStyle: {
        color: series.color,
        borderWidth: 2,
        borderColor: '#fdfcf9',
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: series.areaColor || series.color + '40' },
            { offset: 1, color: series.areaColor || series.color + '05' },
          ],
        },
      },
      animationDuration: 2000,
      animationEasing: 'cubicOut',
    })),
  };

  return (
    <Card
      title={
        <h3 className="text-lg font-semibold font-serif text-forest-800 m-0">{title}</h3>
      }
      className="stagger-item card-hover"
    >
      <ReactECharts option={option} style={{ height }} opts={{ renderer: 'canvas' }} />
    </Card>
  );
};

export default LineChart;
