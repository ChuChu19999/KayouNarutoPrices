import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './Page404.css';

const Page404 = () => (
  <div className="page404">
    <Helmet>
      <title>Ошибка 404 — Товары и цены</title>
    </Helmet>
    <header className="page404__header">
      <h1>Ошибка 404</h1>
      <p>Страница не найдена. Вернитесь к таблице товаров.</p>
      <Link to="/" className="page404__link">
        На главную
      </Link>
    </header>
  </div>
);

export default Page404;
