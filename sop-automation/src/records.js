export const PROJECT_FIELDS = [
  "项目名称",
  "城市",
  "区县/校区",
  "学段",
  "社群周期",
  "开始日期",
  "结束日期",
  "周末规则",
  "模板类型",
  "产品重点",
  "是否需要结营表彰",
  "素材文件夹链接",
  "表扬榜文件说明",
  "生成状态",
  "SOP云文档链接",
  "海报/PPT文件夹链接",
  "备注"
];

export const MATERIAL_FIELDS = [
  "素材名称",
  "素材类型",
  "适用节点",
  "适用学段",
  "关联产品点",
  "素材链接",
  "使用话术提示",
  "状态"
];

export const TEMPLATE_FIELDS = [
  "模板名称",
  "适用学段",
  "周期类型",
  "模板链接",
  "使用说明",
  "状态",
  "运营阶段",
  "适用城市/区域",
  "模板类型",
  "适用学校",
  "产品重点",
  "模板正文",
  "素材配置规则",
  "鼓励师话术规则",
  "转化节点"
];

export const TASK_FIELDS = [
  "任务名称",
  "所属项目",
  "任务类型",
  "城市/学校",
  "活动名称",
  "年级/学段",
  "奖项设置",
  "学生名单",
  "补充要求",
  "生成状态",
  "结果链接",
  "备注"
];

export const SCRIPT_FIELDS = [
  "话术名称",
  "使用场景",
  "适用学段",
  "产品点",
  "话术正文",
  "状态"
];

export const FOLLOWUP_FIELDS = [
  "学生姓名",
  "学校",
  "年级",
  "家长称呼",
  "意向等级",
  "转化状态",
  "异议点",
  "跟进记录",
  "下次跟进时间",
  "备注"
];

export const DASHBOARD_FIELDS = [
  "项目名称",
  "日期",
  "学生数",
  "打卡人数",
  "未打卡人数",
  "意向客户数",
  "成交数",
  "备注"
];

export function rowsToObjects(response) {
  const payload = response.data;
  const fields = payload.fields ?? [];
  const ids = payload.record_id_list ?? [];
  const rows = payload.data ?? [];

  return rows.map((row, index) => {
    const object = { recordId: ids[index] };
    fields.forEach((field, fieldIndex) => {
      object[field] = normalizeCell(row[fieldIndex]);
    });
    return object;
  });
}

export function normalizeCell(value) {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (item && typeof item === "object" && "text" in item) return item.text;
      if (item && typeof item === "object" && "name" in item) return item.name;
      return item;
    });
  }

  if (value && typeof value === "object") {
    if ("text" in value) return value.text;
    if ("link" in value) return value.link;
  }

  return value ?? "";
}

export function firstValue(value) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function listValue(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}
