// 私教详情 该教练下的私教课程列表
import { getCoachDetail } from '@/api/v1/coach'
import brand from '@/store/brand'
import shop from '@/store/shop'
import { sceneDecode } from '@/utils/utils'
import { SHARE_COACH_CODE } from '@/constants/share'
import { getScene } from '@/api/v1/scene'
import { PRICE_SALE_MODEL } from '@/constants/coach'

const app = getApp()

const options = {
  state: {
    coachConfig: brand.coachConfig
  },
  data: {
    coachId: 0,
    PRICE_SALE_MODEL,
    SHARE_COACH_CODE,
    shareIsShow: false,
    shareInfo: {},
    maxLength: 100,
    coach: {
      tag: [],
      mobile: [],
      certification: [],
      course_list: []
    },
    evaluateToal: 0,
    paramIdObj: {}
  },
  onLoad() {
    app.onReady(() => {
      shop.switchShop(app.$route.query.shopId).then((res) => {
        this.setData({ shopId: res })
        this.init()
      })
    })
  },
  init() {
    if (app.$route.query.scene) {
      this.scene()
    } else {
      this.setData({
        coachId: app.$route.query.coach_id,
        paramIdObj: {
          coachId: app.$route.query.coach_id
        }
      })
      this.getCoachInfo()
    }
  },
  scene() {
    getScene({ scene_key: app.$route.query.scene }).then((res) => {
      let params = sceneDecode(res.data.scene)
      shop.setShopId(params.shop_id || params.shopId)
      this.setData({
        coachId: params.coach_id,
        shopId: params.shop_id || params.shopId
      })
      this.getCoachInfo()
    })
  },
  getCoachInfo() {
    getCoachDetail({
      shop_id: this.data.shopId,
      coach_id: this.data.coachId
    }).then((res) => {
      res.data.picList =
        res.data.photo.length > 3 ? res.data.photo.slice(0, 2) : res.data.photo
      this.setData({
        coach: res.data
      })
    })
  },
  shareClose() {
    this.setData({
      shareIsShow: false
    })
  },
  toCourseInfoPage(e) {
    app.$router.push({
      name: 'coach/course/detail',
      query: {
        course_id: e.currentTarget.id,
        coach_id: this.data.coachId
      }
    })
  },
  previewImage() {
    wx.previewImage({
      urls: this.data.coach.photo,
      current: this.data.coach.photo[0]
    })
  },
  totalHandle(e) {
    console.log(e)
    this.setData({
      evaluateToal: e.detail
    })
  },
  onShareAppMessage() {
    return {
      title: `${
        JSON.parse(wx.getStorageSync('userInfo')).nickName
      }向你推荐教练${this.data.coach.name}`,
      path: `views/pages/coach/info?coach_id=${
        this.data.coachId
      }&shopId=${shop.id.get()}`
    }
  },
  coachShare() {
    this.setData({
      shareIsShow: true,
      shareInfo: {
        shopId: this.data.shopId,
        coachId: this.data.coachId
      }
    })
  }
}
app.makePage(options)
