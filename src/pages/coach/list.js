import brand from '@/store/brand'
import shop from '@/store/shop'
import { getCoachList } from '@/api/v1/coach'
import { PRICE_SALE_MODEL } from '@/constants/coach'
import versionConfig from '@/store/version-config'
// 私教列表 教练列表
const app = getApp()

const options = {
  needBaseShare: true,
  state: {
    shopName: shop.name,
    shopId: shop.id,
    customNames: brand.customNames,
    versionConfig
  },
  data: {
    PRICE_SALE_MODEL,
    dataReady: false,
    coach: {
      total: 0,
      list: []
    },
    // 判断显隐
    show_content: []
  },
  onShow() {
    let show_content = []
    let isHaveShow = false
    if (app.$route.query.show_content) {
      isHaveShow = true
      show_content = decodeURIComponent(app.$route.query.show_content)
    }
    this.setData({
      show_content: isHaveShow ? JSON.parse(show_content) : []
    })
  },
  onLoad() {
    app.onReady(() => {
      wx.setNavigationBarTitle({
        title: this.data.customNames.COACH
      })
      this.getCoachList()
    })
  },
  toCoachInfoPage(e) {
    app.$router.push({
      name: 'coach/info',
      query: {
        coach_id: e.currentTarget.id
      }
    })
  },
  getCoachList() {
    getCoachList({
      shop_id: this.data.shopId
    }).then((res) => {
      let list = res.data.list
      list.forEach((item) => {
        item.mobile = item.mobile ? item.mobile.split(',') : []
      })
      this.setData({
        dataReady: true,
        'coach.total': res.data.total,
        'coach.list': list
      })
    })
  }
}

app.makePage(options)
