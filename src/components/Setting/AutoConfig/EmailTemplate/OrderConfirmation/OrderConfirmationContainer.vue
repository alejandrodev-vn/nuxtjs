<script>
import EmailTemplateContainer from '@/components/Setting/AutoConfig/EmailTemplate/EmailTemplateContainer'

export default {
  name: 'OrderConfirmationContainer',
  extends: EmailTemplateContainer,
  data() {
    return {
      type: 'order-confirmation',
    }
  },
}
</script>
