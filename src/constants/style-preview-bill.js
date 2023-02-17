export const styles = [
  `* {
    font-family: 'Inter', sans-serif;
    font-size: 14px;
  }
  @page {
    size: a4;
  }
  p {
    margin: 0;
    margin-bottom: 0.5rem;
  }
  .flex {
    display: flex;
  }
  .flex-col {
    flex-direction: column;
  }
  .items-center {
    align-items: center;
  }
  .justify-center {
    justify-content: center;
  }
  .justify-between {
    justify-content: space-between;
  }
  .text-gray {
    color: #01122280;
  }
  .title {
    color: #22313F;
    font-weight: 600;
    font-size: 16px;
  }
  .preview-bill {
    font-family: 'Inter', sans-serif;
    width: 90%;
    border-radius: 15px;
    border: 0.5px solid #bdbdbd;
    padding: 3rem 2rem;
  }
  .preview-bill__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .preview-bill__header img {
    width: 32px;
  }
  .preview-bill__header--title {
    font-weight: 600;
    font-size: 22px;
    font-family: 'Inter', sans-serif;
    margin-block: 1rem;
  }
  .preview-bill__receiver-information--col {
    width: 45%;
  }
  .receiver-information-item {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
  .receiver-information-item p {
    margin-bottom: 1rem;
  }
  .receiver-information-item .text-left {
    color: #22313F;
    font-size: 16px;
    width: 30%;
  }
  .receiver-information-item .text-right {
    color: #01122280;
    font-size: 16px;
    width: 70%;
    text-align: left;
    padding-left: 1rem;
    line-height: 18px;
  }
  .table-products {
    font-family: 'Inter', sans-serif;
    border-collapse: collapse;
    width: 100%;
  }
  .table-products td, .table-products thead th {
    padding: 8px;
    color: #22313F;
    font-size: 14px;
    border: 1px solid #E8E8E8;
  }
  .table-products td {
    vertical-align: top;
    text-align: center;
    border: 1px solid #E8E8E8;
  }
  .table-products td:first-child {
    text-align: left;
    padding-left: 1rem;
  }
  .table-products thead th {
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: center;
    vertical-align: center;
    color: #22313F;
    border-bottom: 0;
  }
  .table-products thead th:first-child {
    text-align: left;
    padding-left: 1rem;
  }
  .table-products tfoot .text-left, .table-products tfoot .text-right {
    display: inline-block;
    margin: 0.5rem;
  }
  .table-products tfoot .text-left {
    text-align: left;
    color: #52575C;
    font-size: 14px;
    font-weight: 500;
  }
  .table-products tfoot .text-right {
    text-align: right;
    color: #22313F;
    font-size: 14px;
  }
  .table-products tfoot .discount-value {
    text-align: right;
    color: #FB4E4E;
    font-size: 14px;
  }
  .table-products tfoot .total-value {
    text-align: right;
    color: #22313F;
    font-size: 14px;
    font-weight: 700;
  }
  .table-products tfoot .tag-discount-code {
    font-weight: 500;
    color: #488EFF;
  }
  .delivery-information {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
  }
  .delivery-information__col {
    width: 45%;
  }
  .delivery-information__col--item {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .delivery-information__col--item .text-left {
    color: #22313F;
    font-size: 16px;
  }
  .delivery-information__col--item .text-right {
    color: #01122280;
    font-size: 16px;
  }
  `,
]
