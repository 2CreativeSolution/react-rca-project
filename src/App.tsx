import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROUTES } from "./constants/routes";
import { AuthProvider } from "./context/AuthProvider";
import { NotificationProvider } from "./context/NotificationProvider";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layout/MainLayout";

/* Public pages */
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Contact from "./pages/Contact";
import Legal from "./pages/Legal";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

/* Private pages */
import Dashboard from "./pages/Dashboard";
import Catalog from "./pages/Catalog";
import ProductLanding from "./pages/ProductLanding";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderStatus from "./pages/OrderStatus";
import UserSettings from "./pages/UserSettings";
import Orders from "./pages/Orders";

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
            {/* ================= PUBLIC ROUTES ================= */}
            <Route path={ROUTES.home} element={<Landing />} />
            <Route path={ROUTES.login} element={<Login />} />
            <Route path={ROUTES.logout} element={<Logout />} />
            <Route path={ROUTES.signup} element={<Signup />} />
            <Route path={ROUTES.forgotPassword} element={<ForgotPassword />} />
            <Route path={ROUTES.resetPassword} element={<ResetPassword />} />
            <Route path={ROUTES.contact} element={<Contact />} />
            <Route path={ROUTES.legal} element={<Legal />} />
            <Route path={ROUTES.terms} element={<Terms />} />
            <Route path={ROUTES.privacy} element={<Privacy />} />

            {/* ================= PROTECTED ROUTES ================= */}
            <Route
              path={ROUTES.catalog}
              element={
                <ProtectedRoute>
                  <Catalog />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.dashboard}
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.products}
              element={
                <ProtectedRoute>
                  <ProductLanding />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.productDetail}
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.cart}
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.checkout}
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.orderStatus}
              element={
                <ProtectedRoute>
                  <OrderStatus />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.orders}
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.settings}
              element={
                <ProtectedRoute>
                  <UserSettings />
                </ProtectedRoute>
              }
            />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
