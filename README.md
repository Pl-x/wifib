# Легион Коннекшнс - WiFi Billing System

Современная система управления WiFi-сервисом и биллингом, построенная на React и Node.js.

## 🚀 Особенности

- **Современный UI/UX**: Красивый и интуитивный интерфейс с использованием Tailwind CSS
- **Полная функциональность**: Управление клиентами, счетами, платежами и планами
- **Аналитика**: Детальные отчеты и графики с использованием Recharts
- **Адаптивный дизайн**: Работает на всех устройствах
- **Русская локализация**: Полная поддержка русского языка
- **Реальное время**: Обновления данных в реальном времени

## 📋 Компоненты системы

### Основные страницы:
- **Dashboard** - Главная панель с ключевыми метриками
- **Customers** - Управление клиентами (CRUD операции)
- **Billing** - Генерация и управление счетами
- **Payments** - Обработка платежей
- **Plans** - Управление тарифными планами
- **Reports** - Бизнес-аналитика и отчеты

### Компоненты:
- **Layout**: Sidebar, Header, Navigation
- **UI**: StatCard, Modal, Forms, Tables
- **Charts**: Revenue, Customer Distribution, Payment Methods
- **Context**: DataProvider для управления состоянием

## 🛠 Технологии

### Frontend:
- **React 18** - Основной фреймворк
- **React Router** - Навигация
- **Tailwind CSS** - Стилизация
- **Recharts** - Графики и диаграммы
- **Lucide React** - Иконки
- **React Hot Toast** - Уведомления
- **React Hook Form** - Управление формами

### Backend (рекомендуется):
- **Node.js** - Серверная среда
- **Express.js** - Веб-фреймворк
- **MongoDB/PostgreSQL** - База данных
- **JWT** - Аутентификация
- **Multer** - Загрузка файлов
- **Nodemailer** - Отправка email

## 📦 Установка и запуск

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd legion-connections-billing
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Запуск в режиме разработки
```bash
npm start
```

Приложение будет доступно по адресу: http://localhost:3000

### 4. Сборка для продакшена
```bash
npm run build
```

## 🔧 Конфигурация

### Переменные окружения
Создайте файл `.env` в корне проекта:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Легион Коннекшнс
```

## 📊 Структура данных

### Клиенты (Customers)
```javascript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  plan: string,
  status: 'active' | 'inactive' | 'pending',
  address: string,
  joinDate: string,
  lastPayment: string | null
}
```

### Счета (Bills)
```javascript
{
  id: string,
  customerId: string,
  customerName: string,
  amount: number,
  dueDate: string,
  status: 'paid' | 'pending' | 'overdue',
  issueDate: string
}
```

### Платежи (Payments)
```javascript
{
  id: string,
  customerId: string,
  customerName: string,
  amount: number,
  method: string,
  date: string,
  status: 'completed' | 'pending',
  invoiceNumber: string
}
```

### Планы (Plans)
```javascript
{
  id: string,
  name: string,
  speed: string,
  price: number,
  dataLimit: string,
  description: string
}
```

## 🔐 Что еще нужно добавить

### 1. Backend API
```bash
# Создать папку для backend
mkdir backend
cd backend
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
```

### 2. База данных
- **MongoDB** для NoSQL решения
- **PostgreSQL** для реляционной БД
- **Redis** для кэширования

### 3. Аутентификация
- JWT токены
- Роли пользователей (Admin, Manager, Operator)
- Защищенные маршруты

### 4. Дополнительные функции
- **Email уведомления** - напоминания о платежах
- **SMS интеграция** - уведомления клиентов
- **PDF генерация** - счета и отчеты
- **API интеграции** - платежные системы
- **Мониторинг сети** - статус подключений
- **Автоматическое выставление счетов** - по расписанию
- **Система скидок** - промокоды и акции
- **Мультиязычность** - поддержка других языков

### 5. DevOps
- **Docker** - контейнеризация
- **Nginx** - веб-сервер
- **PM2** - управление процессами
- **SSL сертификаты** - HTTPS
- **Backup системы** - резервное копирование

### 6. Мониторинг
- **Logging** - логирование действий
- **Analytics** - аналитика использования
- **Error tracking** - отслеживание ошибок
- **Performance monitoring** - мониторинг производительности

## 🎨 Кастомизация

### Цветовая схема
Измените цвета в `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#your-color',
    // ...
  }
}
```

### Локализация
Добавьте новые языки в компоненты или используйте i18next.

### Темы
Добавьте поддержку темной темы в `DataContext`.

## 📱 Мобильная версия

Приложение полностью адаптивно и работает на:
- 📱 Мобильные телефоны
- 📱 Планшеты
- 💻 Десктопы
- 🖥 Большие экраны

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл LICENSE для деталей.

## 🆘 Поддержка

Если у вас есть вопросы или проблемы:
- Создайте Issue в GitHub
- Обратитесь к документации
- Проверьте примеры в коде

## 🚀 Демо

Демо версия доступна по адресу: [ссылка на демо]

---

**Легион Коннекшнс** - Ваш надежный партнер в управлении WiFi-сервисом! 🌐 