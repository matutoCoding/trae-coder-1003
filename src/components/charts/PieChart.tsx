import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';
import type { EChartsOption } from 'echarts';

interface PieChartProps {
  title: string;
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  height?: number;
}

const PieChart: React.FC<PieChartProps> = ({ title, data, height = 320 }) => {
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(253, 252, 249, 0.95)',
      borderColor: '#b3cda6',
      borderWidth: 1,
      textStyle: {
        color: '#24471f',
      },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: {
        color: '#5e440f',
        fontSize: 12,
      },
      itemGap: 16,
    },
    series: [
      {
        name: '分布',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fdfcf9',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#24471f',
            formatter: '{b}\n{d}%',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(44, 90, 39, 0.3)',
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: item.color },
        })),
        animationDuration: 2000,
        animationEasing: 'cubicOut',
      },
    ],
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

export default PieChart;
