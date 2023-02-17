<script>
import EmailTemplateContainer from '@/components/Setting/AutoConfig/EmailTemplate/EmailTemplateContainer'

export default {
  name: 'CanceledOrderContainer',
  extends: EmailTemplateContainer,
  data() {
    return {
      type: 'canceled-order',
    }
  },
}
</script>
