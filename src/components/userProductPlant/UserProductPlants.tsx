import ProductPlants from 'src/components/productplant/ProductPlants'

interface UserProductPlantsProps {
  customerId?: number | string
  userId?: number | string
}

const UserProductPlants = ({ customerId }: UserProductPlantsProps) => {
  return <ProductPlants customerId={customerId} />
}

export default UserProductPlants
