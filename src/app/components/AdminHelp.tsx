/** Вкладка «Справка» - подробная инструкция по админке */

import type { ReactNode } from "react";
import { AdminApiConnection } from "./admin/AdminApiConnection";

function MockWindow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden text-left max-w-lg">
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="h-2 w-2 rounded-full bg-green-400" />
        <span className="text-[11px] text-gray-500 truncate flex-1 text-center font-medium">{title}</span>
      </div>
      <div className="p-3 text-xs text-gray-600">{children}</div>
    </div>
  );
}

/** Условная «схема» строки списка - как на макете: ручка, переключатель, удалить. */
function RowSchematic() {
  return (
    <div className="space-y-2 font-mono text-[10px] text-gray-500">
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-2 py-2">
        <span className="text-gray-400">⋮⋮</span>
        <span className="flex-1 truncate text-gray-700">Название проекта · год · категория</span>
        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800">на сайте</span>
        <span className="text-red-400">🗑</span>
      </div>
      <p className="text-[11px] text-gray-500 leading-relaxed [font-family:inherit]">
        Слева - ручка для перетаскивания. Справа - «На сайте» и удаление. Подробности раскрываются кликом по строке.
      </p>
    </div>
  );
}

export function AdminHelp() {
  return (
    <div className="max-w-3xl space-y-10 text-sm text-gray-700 pb-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Админ-панель: общие правила</h2>
        <p className="text-gray-500 leading-relaxed">
          Данные сайта лежат в <strong className="text-gray-700">базе</strong> (или в файле <code className="text-xs bg-gray-100 px-1 rounded">server/data/cms.json</code> в режиме без PostgreSQL) и отдаются через API. Чтобы изменения появились на сайте у посетителей, после правок обязательно нажмите <strong className="text-gray-800">«Сохранить»</strong> в соответствующем разделе.
        </p>
        <p className="text-gray-600 mt-2 leading-relaxed">
          <strong className="text-gray-800">Нижняя панель</strong> на экране: всегда видна кнопка <strong className="text-gray-800">«Сохранить в БД»</strong> для <em>текущего</em> открытого раздела (кроме «Заявки» и «Справка») - не нужно пролистывать страницу вверх. Дополнительно в каждом разделе в шапке остаётся своя кнопка «Сохранить».
        </p>
        <p className="text-gray-600 mt-2 leading-relaxed">
          <strong className="text-gray-800">Новая запись</strong> по «Добавить» попадает в начало списка. Вход в админку — только в этом браузере (сессия и 2FA при включении).
        </p>
      </div>

      <MockWindow title="Нижняя панель (схема)">
        <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 bg-slate-50 px-3 py-2">
          <span className="text-[11px] text-gray-500">Сейчас: Проекты</span>
          <span className="rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white shadow-sm">Сохранить в БД</span>
        </div>
        <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">
          Подпись слева показывает активный раздел; справа - то же сохранение, что и кнопка в шапке раздела.
        </p>
      </MockWindow>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">1. Проекты</h3>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
          <li>
            <strong className="text-gray-800">На сайте</strong> - выключите, чтобы скрыть проект с сайта, галереи, услуг (удалять не обязательно).
          </li>
          <li>
            Клик по строке <strong className="text-gray-800">раскрывает</strong> карточку; слева иконка с точками - <strong className="text-gray-800">перетаскивайте</strong> за неё, чтобы менять порядок.
          </li>
          <li>
            <strong className="text-gray-800">Главная (слайдер и блок «Наши работы»):</strong> попадают опубликованные проекты в общем порядке. <strong className="text-gray-800">Нет фото</strong> - на сайте показывается нейтральная заглушка «Материал готовится» с названием. В слайдере в шапке настройка «Слайдер на главной» - варианты: автоматически, всегда (даже с заглушкой), не показывать.
          </li>
          <li>Обложка, галерея (фото на странице проекта не обрезаются автоматически), описание, год, <strong className="text-gray-800">категория</strong> (для подбора в услугах, если в разделе «Услуги» не заданы примеры вручную).</li>
        </ul>
        <MockWindow title="Проекты (схема)">
          <RowSchematic />
        </MockWindow>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">2. Услуги (примеры к проектам)</h3>
        <p className="text-gray-600">
          К каждому направлению со страницы «Услуги» можно привязать до 6 опубликованных проектов-образцев. Список пустой: на сайте подставляются проекты <strong className="text-gray-800">по полю «Категория»</strong> у проекта. «Сбросить к автоподбору» очищает ручной выбор.
        </p>
        <MockWindow title="Услуги - выбор проекта">
          <div className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-2 text-[11px] text-gray-700">
            Выпадающий список показывает <strong className="text-gray-800">название и год</strong> - без служебных номеров, чтобы было понятно, какой объект выбрать.
          </div>
        </MockWindow>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">3. Новости, отзывы, партнёры</h3>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
          <li>
            <strong className="text-gray-800">Новости</strong> - превью в карточке (без обрезки), дата, галерея, текст; порядок - перетаскивание.
          </li>
          <li>
            <strong className="text-gray-800">Отзывы</strong> - при необходимости укажите связанный проект в списке (там же - только названия, без id).
          </li>
          <li>
            <strong className="text-gray-800">Партнёры</strong> - название, ссылка (пустая — карточка в ленте не кликабельна), порядок.
          </li>
        </ul>
        <MockWindow title="Карточка списка (новости / отзывы)">
          <p className="text-[11px] leading-relaxed">
            Под заголовком - дата, <strong>порядок</strong> в списке, пометка «скрыт», если карточка не на сайте. Внутренние номера в интерфейсе не показываются.
          </p>
        </MockWindow>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">4. Заявки</h3>
        <p className="text-gray-600">
          Вкладки сверху: <strong className="text-gray-800">Все</strong>, <strong className="text-gray-800">Калькулятор</strong>,{" "}
          <strong className="text-gray-800">Формы</strong> (контакты, плавающая кнопка), <strong className="text-gray-800">Попап</strong>.
          На кнопке фильтра красный кружок — сколько заявок со статусом «Новая» в этом разделе; то же число у пункта «Заявки» в меню слева.
        </p>
        <ul className="list-disc pl-5 text-gray-600 space-y-1.5 text-sm">
          <li>
            <strong className="text-gray-800">Номер</strong> — уникальный в категории: CALC-001 (калькулятор), FORM-002 (формы), POP-003 (попап).
          </li>
          <li>
            <strong className="text-gray-800">Телефон</strong> — нажмите, чтобы позвонить с телефона. «Копировать» / «Поделиться» — текст заявки для мессенджера.
          </li>
          <li>
            <strong className="text-gray-800">Статусы</strong> — «Не обработана», «В работе», «Архив». Комментарий менеджера сохраняется отдельной кнопкой.
          </li>
          <li>
            <strong className="text-gray-800">Страницы</strong> — по 8 заявок, кнопки «Назад» / «Далее» внизу списка.
          </li>
          <li>
            <strong className="text-gray-800">Обновить</strong> — подтянуть список с сервера. «Очистить все» / «Удалить» — без восстановления.
          </li>
        </ul>
        <p className="text-gray-600">
          Уведомления в Telegram и на почту — в <code className="text-xs bg-gray-100 rounded px-1">server/.env</code>, см. «Настройки».
        </p>
        <MockWindow title="Карточка заявки">
          <div className="rounded-2xl border-2 border-blue-400 bg-blue-50/50 p-2 text-[10px] space-y-1">
            <div className="flex justify-between gap-2">
              <span className="font-mono font-bold text-blue-800">CALC-003</span>
              <span className="text-blue-600">Калькулятор</span>
            </div>
            <p className="font-semibold text-gray-800">Иван И.</p>
            <p className="text-blue-700 underline">+7 (916) …</p>
            <div className="flex gap-1 flex-wrap pt-1">
              <span className="rounded-full bg-blue-700 text-white px-2 py-0.5">Позвонить</span>
              <span className="rounded-full border px-2 py-0.5">Копировать</span>
              <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5">В работе</span>
            </div>
          </div>
        </MockWindow>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">5. Показатели и «О компании»</h3>
        <p className="text-gray-600">
          Показатели: три блока цифр на главной — значение и подпись. «О компании»: клик по секции для правки, клик вне рамок снимает выделение; фото производства — как в проектах (крупные файлы раздувают JSON).
        </p>
        <MockWindow title="Показатели (сетка)">
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="rounded border border-gray-100 bg-slate-50 p-2">
              <div className="text-lg font-bold text-blue-600 tabular-nums">120</div>
              <div className="text-gray-400">поле 1</div>
            </div>
            <div className="rounded border border-gray-100 bg-slate-50 p-2">
              <div className="text-lg font-bold text-blue-600 tabular-nums">45</div>
              <div className="text-gray-400">поле 2</div>
            </div>
            <div className="rounded border border-gray-100 bg-slate-50 p-2">
              <div className="text-lg font-bold text-blue-600 tabular-nums">12</div>
              <div className="text-gray-400">поле 3</div>
            </div>
          </div>
        </MockWindow>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">6. Настройки</h3>
        <p className="text-gray-600">
          Телефон (маска +7 при вводе), email, адреса офиса и производства (карта на «Контактах»), режим, мессенджеры.
        </p>
        <p className="text-gray-600">
          <strong className="text-gray-800">Уведомления о заявках (сервер)</strong> — в <code className="text-xs bg-gray-100 rounded px-1">server/.env</code>:{" "}
          <code className="text-xs">TELEGRAM_BOT_TOKEN</code>, <code className="text-xs">TELEGRAM_CHAT_ID</code>, <code className="text-xs">SMTP_*</code>,{" "}
          <code className="text-xs">LEAD_TO_EMAIL</code>. Старые токены в JSON в публичный API не отдаются.
        </p>
        <p className="text-gray-600">
          <strong className="text-gray-800">2FA</strong> — QR, секрет, код из приложения, «Активировать». Нужен <code className="text-xs bg-gray-100 rounded px-1">/api</code> и{" "}
          <code className="text-xs bg-gray-100 rounded px-1">VITE_ADMIN_API_KEY</code> при сборке.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">7. Маркетинг (в «Настройках»)</h3>
        <ul className="list-disc pl-5 space-y-1.5 text-gray-600">
          <li>Всплывающая форма — задержка, частота (сессия / сутки), шаблоны.</li>
          <li>Cookie и Метрика — только после согласия; ID счётчика, карта кликов, вебвизор (может запрашивать доступ к устройству).</li>
          <li>Лёгкий режим — меньше анимаций на слабых устройствах.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">8. Статистика</h3>
        <p className="text-gray-600">
          Внутренний счётчик просмотров (после cookie) и отчёты в кабинете Яндекс.Метрики. Для SEO — sitemap.xml и Вебмастер.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">9. Подключение к API</h3>
        <p className="text-gray-600">Если «Сохранить» не работает — проверьте ключ ниже.</p>
        <AdminApiConnection />
      </section>
    </div>
  );
}
