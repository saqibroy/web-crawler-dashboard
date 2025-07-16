import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const BackToDashboard = () => (
  <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
    <ArrowLeft className="h-5 w-5 mr-2" />
    Back to Dashboard
  </Link>
)

export default BackToDashboard
