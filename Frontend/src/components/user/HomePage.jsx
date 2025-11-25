import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import '../../styles/global.scss';
const Homepage = () => {
    return (
        <div>
            <Header />
            <Outlet />
            <Footer />
        </div>
    );
}
export default Homepage;