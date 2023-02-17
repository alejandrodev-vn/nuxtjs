<script>
import EmailTemplateContainer from '@/components/Setting/AutoConfig/EmailTemplate/EmailTemplateContainer'

export default {
  name: 'DeliveredOrderContainer',
  extends: EmailTemplateContainer,
  data() {
    return {
      type: 'delivered-order',
    }
  },
}
</script>
