const baseUrl = process.env.SMOKE_BASE_URL ?? 'http://localhost:4177'

const response = await fetch(`${baseUrl}/api/summersop/feishu/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    主题: '7月暑促体验课报名',
    年级: '初中',
    阶段: '体验课邀约',
    目标: '体验课报名',
    语气: '代理商地推',
  }),
})

if (!response.ok) {
  throw new Error(`Expected 2xx response, got ${response.status}`)
}

const payload = await response.json()
const fields = payload?.data?.fields

for (const key of ['群公告', '群内互动话术', '朋友圈文案', '私聊话术', '执行清单', '生成状态']) {
  if (!fields?.[key]) {
    throw new Error(`Missing Feishu output field: ${key}`)
  }
}

if (fields.生成状态 !== '已生成') {
  throw new Error(`Expected 生成状态 to be 已生成, got ${fields.生成状态}`)
}

console.log('smoke-feishu-summersop: PASS')
