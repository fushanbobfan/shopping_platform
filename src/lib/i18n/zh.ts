export const zh = {
  brand: "小衣柜",
  tagline: "朋友的衣柜，公开出售",
  nav: {
    home: "首页",
    cart: "购物车",
    admin: "管理后台"
  },
  home: {
    empty: "暂时没有在售的衣服，稍后再来看看～",
    viewDetails: "查看详情"
  },
  product: {
    size: "尺码",
    category: "类别",
    condition: "新旧程度",
    addToCart: "加入购物车",
    inCart: "已在购物车",
    sold: "已售出",
    reserved: "他人结账中"
  },
  cart: {
    title: "购物车",
    empty: "购物车是空的",
    remove: "移除",
    total: "合计",
    checkout: "去结账",
    continueShopping: "继续逛逛"
  },
  checkout: {
    title: "结算",
    review: "请确认商品，下一步将跳转到 Stripe 安全支付页完成付款和填写收货地址。",
    pay: "前往支付",
    creating: "正在创建订单…",
    error: "下单失败，请刷新重试",
    sold: "其中有商品刚刚被售出或被他人正在结账，请返回购物车调整。"
  },
  success: {
    title: "付款成功，感谢你的购买！",
    orderId: "订单编号",
    next: "我们会在确认到账后尽快安排发货，如有任何问题请联系卖家。",
    backHome: "返回首页"
  },
  admin: {
    login: {
      title: "管理员登录",
      password: "密码",
      submit: "登录",
      error: "密码不正确"
    },
    nav: {
      products: "商品",
      orders: "订单",
      logout: "退出"
    },
    products: {
      title: "商品管理",
      new: "上架新商品",
      edit: "编辑商品",
      delete: "下架",
      confirmDelete: "确认下架该商品吗？"
    },
    orders: {
      title: "订单管理",
      markShipped: "标记已发货",
      shipped: "已发货",
      pending: "待付款",
      paid: "已付款",
      cancelled: "已取消"
    },
    form: {
      name: "名称",
      description: "描述",
      price: "价格（元）",
      size: "尺码",
      category: "类别",
      condition: "新旧程度",
      images: "图片",
      uploadImage: "上传图片",
      save: "保存",
      cancel: "取消"
    }
  }
} as const;

export type Dict = typeof zh;
