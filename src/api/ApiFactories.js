import Analytics from '@/api/factory/Analytics'
import Setting from '@/api/factory/Setting'
import Common from '@/api/factory/Common'
import Conversation from '@/api/factory/Conversation'
import Fan from '@/api/factory/Fan'
import Response from '@/api/factory/Response'
import UnsafeKeyword from '@/api/factory/UnsafeKeyword'
import Note from '@/api/factory/Note'
import SocialPosts from '@/api/factory/SocialPosts'
import Tags from '@/api/factory/Tags'
import User from '@/api/factory/User'
import TagsGuest from '@/api/factory/TagsGuest'
import ResponseTemplate from '@/api/factory/ResponseTemplate'
import SocialChannel from '@/api/factory/SocialChannel'
import Level from '@/api/factory/Level'
import ResponseHistory from '@/api/factory/ResponseHistory'
import Location from '@/api/factory/Location'
import Delivery from '@/api/factory/Delivery'
import Discount from '@/api/factory/Discount'
import Order from '@/api/factory/Order'
import Product from '@/api/factory/Product'
import Branch from '@/api/factory/Branch'
import Category from '@/api/factory/Category'
import Customer from '@/api/factory/Customer'
import EmailTemplates from '@/api/factory/EmailTemplates'
import OrderForm from '@/api/factory/OrderForm'
import Notifications from '@/api/factory/Notifications'
import Keyword from '@/api/factory/Keyword'

/**
 * Register Model here
 *
 * @param $axios
 * @return Object
 */

export default ($axios) => ({
  analytics: new Analytics($axios),
  setting: new Setting($axios),
  common: new Common($axios),
  conversation: new Conversation($axios),
  fan: new Fan($axios),
  response: new Response($axios),
  unsafeKeyword: new UnsafeKeyword($axios),
  note: new Note($axios),
  socialPosts: new SocialPosts($axios),
  tags: new Tags($axios),
  user: new User($axios),
  tagsGuest: new TagsGuest($axios),
  responseTemplate: new ResponseTemplate($axios),
  socialChannel: new SocialChannel($axios),
  level: new Level($axios),
  responseHistory: new ResponseHistory($axios),
  location: new Location($axios),
  delivery: new Delivery($axios),
  discount: new Discount($axios),
  order: new Order($axios),
  product: new Product($axios),
  branch: new Branch($axios),
  category: new Category($axios),
  customer: new Customer($axios),
  emailTemplate: new EmailTemplates($axios),
  orderForm: new OrderForm($axios),
  notifications: new Notifications($axios),
  keyword: new Keyword($axios),
})
