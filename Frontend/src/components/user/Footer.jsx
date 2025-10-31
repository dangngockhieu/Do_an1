import './Footer.scss';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">
            <div className="container app-footer__inner">
                <div className="app-footer__brand">
                    <span className="app-footer__brand-mark">TechZone</span>
                    <p>
                        Premium laptops and flagship phones with nationwide delivery, financing, and certified
                        after sales support.
                    </p>
                    <div className="app-footer__contact">
                        <a href="tel:18001234">Hotline: 1800 1234</a>
                        <a href="mailto:laptopshop8386@laptopshop.vn">Email: laptopshop8386@laptopshop.vn</a>
                        <span>Showroom: Ta Quang Buu Street, Dong Hoa Ward , Ho Chi Minh City</span>
                    </div>
                </div>
                <div className="app-footer__column">
                    <h4>Shop</h4>
                    <a href="#laptops">Performance laptops</a>
                    <a href="#phones">Flagship phones</a>
                    <a href="#deals">Bundle deals</a>
                    <a href="#services">Services</a>
                </div>
            </div>
            <div className="container app-footer__bottom">
                <span>© {currentYear} TechZone. All rights reserved.</span>
                <div className="app-footer__legal">
                    <a href="#privacy">Privacy</a>
                    <a href="#terms">Terms</a>
                    <a href="#support">Warranty policy</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;