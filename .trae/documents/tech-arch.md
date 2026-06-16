## 1. 架构设计

```mermaid
graph TD
    subgraph "前端应用层"
        A["React 18 应用"]
        B["React Router 路由管理"]
        C["Zustand 状态管理"]
        D["ECharts 数据可视化"]
        E["Ant Design UI组件库"]
    end

    subgraph "数据层"
        F["Mock 数据服务"]
        G["LocalStorage 本地存储"]
        H["TypeScript 类型定义"]
    end

    subgraph "服务层"
        I["API 接口封装"]
        J["工具函数库"]
        K["业务逻辑处理"]
    end

    A --> B
    A --> C
    A --> D
    A --> E
    C --> F
    C --> G
    I --> F
    J --> H
    K --> I
    K --> J
```

## 2. 技术栈说明

- **前端框架**：React 18 + TypeScript 5
- **构建工具**：Vite 5
- **UI 组件库**：Ant Design 5
- **路由管理**：React Router v6
- **状态管理**：Zustand 4
- **数据可视化**：ECharts 5
- **图标库**：Lucide React
- **样式方案**：TailwindCSS 3
- **日期处理**：Day.js
- **HTTP 请求**：Axios
- **地图组件**：Leaflet（开源地图）
- **后端**：无（纯前端Mock数据）
- **数据存储**：LocalStorage + Mock数据

## 3. 路由定义

| 路由路径 | 页面名称 | 说明 |
|----------|----------|------|
| / | 首页概览 | 项目统计数据、关键指标看板 |
| /project | 项目台账 | 碳汇项目档案、项目年度报告 |
| /forest | 林地资源 | 林地小班区划、林权权属 |
| /monitoring | 碳汇监测 | 树种胸径测量、固碳增量监测 |
| /accounting | 计量核算 | 生物量碳储量核算、碳汇计量模型 |
| /trading | 交易管理 | 第三方核查、碳汇签发登记、碳排放权交易 |
| /management | 营林管护 | 营林抚育管护、抚育作业记录 |
| /revenue | 收益分配 | 收益分配台账、收益统计分析 |

## 4. 数据模型

### 4.1 实体关系图

```mermaid
erDiagram
    PROJECT ||--o{ SUBCOMPARTMENT : "包含"
    PROJECT ||--o{ MONITORING_RECORD : "产生"
    PROJECT ||--o{ VERIFICATION : "经过"
    PROJECT ||--o{ CARBON_ISSUANCE : "生成"
    PROJECT ||--o{ TRANSACTION : "参与"
    PROJECT ||--o{ REVENUE_DISTRIBUTION : "产生"
    SUBCOMPARTMENT ||--o{ TREE_MEASUREMENT : "包含"
    TREE_MEASUREMENT ||--o{ BIOMASS_CALCULATION : "计算"
    CARBON_ISSUANCE ||--o{ TRANSACTION : "交易"
    TRANSACTION ||--o{ REVENUE_DISTRIBUTION : "分配"
    PROJECT ||--o{ NURSING_TASK : "包含"
    PROJECT ||--o{ ANNUAL_REPORT : "生成"

    PROJECT {
        string id "项目ID"
        string name "项目名称"
        string type "项目类型"
        string status "项目状态"
        date start_date "开始日期"
        date end_date "结束日期"
        number total_area "总面积(公顷)"
        string location "项目地点"
        string owner "业主单位"
    }

    SUBCOMPARTMENT {
        string id "小班ID"
        string project_id "项目ID"
        string code "小班编号"
        string name "小班名称"
        number area "面积(公顷)"
        string dominant_tree "优势树种"
        number age "林龄"
        string soil_type "土壤类型"
        string geometry "地理坐标"
    }

    TREE_MEASUREMENT {
        string id "测量ID"
        string subcompartment_id "小班ID"
        date measure_date "测量日期"
        string tree_species "树种"
        number dbh "胸径(cm)"
        number tree_height "树高(m)"
        number crown_width "冠幅(m)"
    }

    MONITORING_RECORD {
        string id "监测ID"
        string project_id "项目ID"
        date record_date "记录日期"
        number carbon_increment "固碳增量(tCO2e)"
        number biomass "生物量(t)"
        string monitoring_method "监测方法"
    }

    BIOMASS_CALCULATION {
        string id "核算ID"
        string measurement_id "测量ID"
        string model_type "模型类型"
        number biomass_above "地上生物量(t)"
        number biomass_below "地下生物量(t)"
        number carbon_stock "碳储量(tC)"
        number co2_equivalent "CO2当量(tCO2e)"
    }

    VERIFICATION {
        string id "核查ID"
        string project_id "项目ID"
        string verification_agency "核查机构"
        date verification_date "核查日期"
        string verifier "核查人员"
        string conclusion "核查结论"
        number verified_amount "核查碳汇量"
    }

    CARBON_ISSUANCE {
        string id "签发ID"
        string project_id "项目ID"
        string verification_id "核查ID"
        date issuance_date "签发日期"
        number issued_amount "签发量(tCO2e)"
        string certificate_no "证书编号"
    }

    TRANSACTION {
        string id "交易ID"
        string project_id "项目ID"
        string issuance_id "签发ID"
        date transaction_date "交易日期"
        string buyer "买方"
        string seller "卖方"
        number quantity "交易量(tCO2e)"
        number unit_price "单价(元/t)"
        number total_amount "交易总额(元)"
    }

    REVENUE_DISTRIBUTION {
        string id "分配ID"
        string transaction_id "交易ID"
        string recipient "分配对象"
        number amount "分配金额(元)"
        number ratio "分配比例(%)"
        date distribute_date "分配日期"
        string status "到账状态"
    }

    NURSING_TASK {
        string id "任务ID"
        string project_id "项目ID"
        string task_name "任务名称"
        string task_type "抚育类型"
        date plan_date "计划日期"
        string executor "执行人"
        number progress "进度(%)"
        string status "任务状态"
    }

    ANNUAL_REPORT {
        string id "报告ID"
        string project_id "项目ID"
        string year "报告年度"
        date submit_date "提交日期"
        string auditor "审核人"
        string status "审核状态"
        string file_url "报告文件"
    }
```

### 4.2 数据初始化

系统采用Mock数据，包含：
- 5个碳汇项目示例数据
- 每个项目包含10-20个林地小班数据
- 3年的监测记录和测量数据
- 完整的核算、核查、签发、交易和分配流程数据
- 营林管护任务和年度报告数据

## 5. 目录结构

```
src/
├── assets/              # 静态资源
│   ├── images/          # 图片资源
│   └── styles/          # 全局样式
├── components/          # 公共组件
│   ├── layout/          # 布局组件
│   ├── charts/          # 图表组件
│   ├── table/           # 表格组件
│   └── common/          # 通用组件
├── pages/               # 页面组件
│   ├── dashboard/       # 首页概览
│   ├── project/         # 项目台账
│   ├── forest/          # 林地资源
│   ├── monitoring/      # 碳汇监测
│   ├── accounting/      # 计量核算
│   ├── trading/         # 交易管理
│   ├── management/      # 营林管护
│   └── revenue/         # 收益分配
├── store/               # 状态管理
├── services/            # API服务
├── mock/                # Mock数据
├── types/               # TypeScript类型定义
├── utils/               # 工具函数
├── App.tsx
├── main.tsx
└── router.tsx           # 路由配置
```

## 6. 性能优化

- 代码分割：按路由进行懒加载
- 虚拟滚动：大数据量表格使用虚拟滚动
- 图表懒加载：滚动到可视区域再渲染图表
- 状态优化：使用Zustand避免不必要的重渲染
- 防抖节流：搜索、滚动等高频操作优化
- 缓存策略：静态资源哈希命名，Mock数据本地缓存
