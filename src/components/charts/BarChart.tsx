import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';
import type { EChartsOption } from 'echarts';

interface BarChartProps {
  title: string;
  xData: string[];
  seriesData: {
    name: string;
    data: number[];
    color: string;
  }[];
  yAxisName?: string;
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({
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
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(134, 179, 116, 0.1)',
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
      data: xData,
      axisLine: {
        lineStyle: {
          color: '#d1c5ab',
        },
      },
      axisLabel: {
        color: '#5e440f',
        fontSize: 11,
        rotate: xData.length > 6 ? 30 : 0,
      },
      axisTick: {
        show: false,
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
      type: 'bar',
      barWidth: '40%',
      data: series.data,
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: series.color },
            { offset: 1, color: series.color + 'aa' },
          ],
        },
        borderRadius: [6, 6, 0, 0],
      },
      emphasis: {
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: series.color + 'dd' },
              { offset: 1, color: series.color + '88' },
            ],
          },
          shadowBlur: 10,
          shadowColor: series.color + '40',
        },
      },
      animationDuration: 2000,
      animationEasing: 'elasticOut',
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

export default BarChart;
