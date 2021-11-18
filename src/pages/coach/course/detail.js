import { getCoachPersonalCourseDetail } from '@/api/v1/coach'
import personalCourse from '@/store/appointment/personal-course'
import { PRICE_SALE_MODEL } from '@/constants/coach'
import { OSS_COACH } from '@/constants/oss/coach'
import Groupbuy from '@/services/groupbuy/groupbuy.info'
import brand from '@/store/brand'
import shop from '@/store/shop'
import { stToast } from '@/utils/utils'

// 私教课详情
const app = getApp()
const routeList = {
  personal1v1buy: 'course/personal/1v1/buy/confirm'
}
const options = {
  // 注册拼团
  groupbuy: new Groupbuy(),
  routeList,
  state: {
    coachConfig: brand.coachConfig,
    shopId: shop.id
  },
  courseId: '',
  coachId: '', // 前一页的教练id
  data: {
    PRICE_SALE_MODEL,
    OSS_COACH,
    sexColor: ['', '#FF5F40', '#3F66F6'],
    coachCourse: false, // 是否是教练私教课,已经知道教练
    detail: {
      coursePrice: '0'
    },
    selectedCoachId: '',
    selectedCoachName: '',
    cancelPayShow: false,
    notPaySeconds: 300,
    showDetails: true,
    evaluateToal: 0,
    // 学员程评价使用
    paramIdObj: {}
  },
  coachItemClick(e) {
    this.setData({
      selectedCoachId: e.currentTarget.dataset.coach.coachId - 0,
      selectedCoachName: e.currentTarget.dataset.coach.coachName
    })
  },
  onLoad() {
    this.coachId = app.$route.query.coach_id
    this.courseId = app.$route.query.course_id
    // 课程评价
    let paramIdObj = {
      coachId: app.$route.query.coach_id,
      courseId: app.$route.query.course_id
    }
    this.setData({
      paramIdObj
    })
    // 初始化拼团相关类
    this.groupbuy.init(this)
    app.onReady(() => {
      this.setData({
        showDetails: !app.$route.query.showDetails,
        courseId: app.$route.query.course_id,
        coachId: app.$route.query.coach_id
      })
      shop.switchShop(app.$route.query.shopId).then(res => {
        this.setData({ shopId: res })
        this.getCoachPersonalCourse()
      })
    })
  },
  onUnload() {
    this.groupbuy.clearGroupbuyInterval()
  },
  callCoachPhone () {
    const mobile = this.data.detail.coachInfo.mobile
    if (mobile) {
      wx.showActionSheet({
        itemList: [mobile],
        success: () => {
          wx.makePhoneCall({
            phoneNumber: mobile
          })
        }
      })
    } else {
      stToast('商家暂无联系电话，请到店咨询')
    }
  },
  getCoachPersonalCourse () {
    getCoachPersonalCourseDetail({
      shop_id: this.data.shopId,
      coach_id: this.coachId,
      course_id: this.courseId
    }).then(res => {
      let course = res.data
      wx.setNavigationBarTitle({
        title: course.course_name
      })
      const detail = {
        courseName: course.course_name,
        courseImage: course.image.image_url,
        courseDuration: course.duration,
        courseTypeName: course.course_type_name,
        coursePrice: course.price,
        saleModel: course.sale_model,
        coachInfo: course.coach_info,
        shopName: course.shop_info.shop_name,
        shopAddress: course.shop_info.address,
        shopAddressLat: course.shop_info.lat,
        shopAddressLng: course.shop_info.lng,
        trainingPurpose: course.training_purpose.join(' '),
        sellStatus: course.sell_status,
        description: course.description
      }
      this.setData({
        detail
      })
      // 设置拼团信息
      this.groupbuy.setGroupbuyInfo(res.data.coach_info)
    })
  },
  openMap () {
    wx.openLocation({
      latitude: this.data.detail.shopAddressLat - 0,
      longitude: this.data.detail.shopAddressLng - 0,
      name: this.data.detail.shop_name,
      address: this.data.detail.shopAddress
    })
  },
  toBuyPage () {
    app.$router.push({
      name: this.routeList.personal1v1buy,
      query: {
        course_id: this.courseId,
        coach_id: this.coachId,
        isbuy: 1
      }
    })
    personalCourse.courseName.set(this.data.detail.courseName)
    personalCourse.shopName.set(this.data.detail.shopName)
    personalCourse.courseImage.set(this.data.detail.courseImage)
    personalCourse.coachName.set(this.data.detail.coachInfo.nickname)
  },
  showCancelPay () {
    this.setData({ cancelPayShow: true })
  },
  hideCancelPay () {
    this.setData({ cancelPayShow: false })
  },
  cancelPayTimeout () {
    this.setData({ 'detail.status': 1 })
    this.hideCancelPay()
  },
  totalHandle(e) {
    console.log(e)
    this.setData({
      evaluateToal: e.detail
    })
  },
  onShareAppMessage () {
    return {
      title: '分享私教课',
      imageUrl: `https://styd-frontend.oss-cn-shanghai.aliyuncs.com/images/minaPro/course/course_detail_${Math.floor(Math.random() * 10) % 2}.png`,
      path: `views/pages/coach/course/detail?course_id=${this.courseId}&coach_id=${this.coachId}&shopId=${shop.id.get()}`
    }
  }
}
app.makePage(options)
