<script>
import EmailTemplateContainer from '@/components/Setting/AutoConfig/EmailTemplate/EmailTemplateContainer'

export default {
  name: 'FailedOrderContainer',
  extends: EmailTemplateContainer,
  data() {
    return {
      type: 'failed-order',
    }
  },
}
</script>
