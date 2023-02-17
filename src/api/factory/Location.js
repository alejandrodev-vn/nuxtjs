import BaseModel from '@/api/BaseModel'

export default class Location extends BaseModel {
  getResource() {
    const countries = 'countries'
    const provinces = 'provinces'
    const districts = 'districts'
    const wards = 'wards'
    return {
      countries,
      provinces,
      districts,
      wards,
    }
  }

  async getCountries(params) {
    const { data } = await this.$request.$get(
      `${this.getResource().countries}`,
      { params }
    )
    return { data }
  }

  async getProvinces(params) {
    const { data } = await this.$request.$get(
      `${this.getResource().provinces}`,
      { params }
    )
    return { data }
  }

  async getDistricts(idProvince, params) {
    const { data } = await this.$request.$get(
      `${this.getResource().provinces}/${idProvince}/${
        this.getResource().districts
      }`,
      { params }
    )
    return { data }
  }

  async getWards(idProvince, idDistrict, params) {
    const { data } = await this.$request.$get(
      `${this.getResource().provinces}/${idProvince}/${
        this.getResource().districts
      }/${idDistrict}/${this.getResource().wards}`,
      { params }
    )
    return { data }
  }
}
