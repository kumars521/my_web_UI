import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingOverlay from './components/LoadingOverlay';
import './App.css';
import heroelement from './assets/HeroModel.png';
import Login from "./components/form/FormLogin";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

// Lazy load route components
const HomePage = lazy(() => import('./components/Homepage'));
const CreateCustomer = lazy(() => import('./customer/CreateCustomer'));
const EnergyErpForm = lazy(() => import('./customer/Energyerpform'));
const MarineErpForm = lazy(() => import('./customer/MarineForm'));
const Vessel = lazy(() => import('./customer/Createvessel'));
const Invoice = lazy(() => import('./customer/Createinvoice'));
const InvoiceDetails = lazy(() => import('./customer/Createinvoice_Detals'));
const Quarantine_Form = lazy(() => import('./customer/Quarantine_Form'));
const Offers_Form = lazy(() => import('./customer/Offers_Form'));
const Dimensions = lazy(() => import('./customer/Dimensions'));
const Purchase_Order = lazy(() => import('./customer/Purchase_Order'));
const Energy_Page = lazy(() => import('./customer/Energy_Page'));
const MarineForm = lazy(() => import('./customer/MarineForm'));
const MarineForm_SalesForce = lazy(() => import('./customer/MarineForm_SalesForce'));
const EnergyErpForm_SalesForce = lazy(() => import('./customer/Energyerpform_SalesForce'));
// const InvoiceDetails = lazy(() => import('./customer/Createinvoice_Detals'));

// Loading fallback component
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
  </div>
);

function App() {
  const [count, setCount] = useState(0);

  return (
    // <AuthProvider>
      <BrowserRouter>
        <Header />
        <img src={heroelement} alt="" />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Route */}
            {/* <Route path="/login" element={<Login />} /> */}

            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                //<ProtectedRoute>
                  <HomePage />
                //</ProtectedRoute>
              } 
            />
            <Route 
              path="/customer" 
              element={
                //<ProtectedRoute>
                  <CreateCustomer />
                //</ProtectedRoute>
              } 
            />
            <Route 
              path="/energyerpform" 
              element={
                //<ProtectedRoute>
                  <EnergyErpForm />
                //</ProtectedRoute>
              } 
            />
            <Route 
              path="/vessel" 
              element={
                //<ProtectedRoute>
                  <Vessel />
                //</ProtectedRoute>
              } 
            />
            <Route 
              path="/invoice" 
              element={
                //<ProtectedRoute>
                  <Invoice />
                //</ProtectedRoute>
              } 
            />
            <Route 
              path="/invoicedetails" 
              element={
                //<ProtectedRoute>
                  <InvoiceDetails />
                //</ProtectedRoute>
              } 
            />
            <Route 
              path="/purchase_order" 
              element={
                //<ProtectedRoute>
                  <Purchase_Order />
                //</ProtectedRoute>
              } 
            />
            <Route 
              path="/energypage" 
              element={
                //<ProtectedRoute>
                  <Energy_Page />
                //</ProtectedRoute>
              } 
            />
            <Route 
              path="/quarantine_form" 
              element={
                //<ProtectedRoute>
                  <Quarantine_Form />
                //</ProtectedRoute>
              } 
            />
            <Route 
              path="/offers_form" 
              element={
                //<ProtectedRoute>
                  <Offers_Form />
                //</ProtectedRoute>
              } 
            />
            <Route 
              path="/dimensions" 
              element={
                //<ProtectedRoute>
                  <Dimensions />
                //</ProtectedRoute>
              } 
            />
            <Route 
              path="/marineerpform" 
              element={
                //<ProtectedRoute>
                  <MarineForm />
                //</ProtectedRoute>
              } 
            />
            <Route 
              path="/MarineForm_SalesForce" 
              element={
                //<ProtectedRoute>
                  <MarineForm_SalesForce />
                //</ProtectedRoute>
              } 
            />
            <Route 
              path="/energyerpform_Salesforce" 
              element={
                //<ProtectedRoute>
                  <EnergyErpForm_SalesForce />
                //</ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>

        <LoadingOverlay />

        <Footer />
      </BrowserRouter>
    // </AuthProvider>
  );
}

export default App;