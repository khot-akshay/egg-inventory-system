import { useRouter } from 'next/router'
import AddUserDialog from 'src/components/admin/user/AddUser'

const AddUser = () => {
  const router = useRouter()

  return <AddUserDialog open handleClose={() => router.back()} fetchData={() => undefined} />
}

export default AddUser
