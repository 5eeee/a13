/** Вкладка «Справка» - подробная инструкция по админке */

import type { ReactNode } from "react";

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
          <strong className="text-gray-800">Новая запись</strong> (проект, новость, отзыв, партнёр) по кнопке «Добавить» <strong className="text-gray-800">сразу попадает в начало списка</strong> (порядок 1) - так проще увидеть свежий материал и на сайте он идёт первым, если ничего не перетаскивать.
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
          <li>Обложка, галерея, описание, год, <strong className="text-gray-800">категория</strong> (для подбора в услугах, если в разделе «Услуги» не заданы примеры вручную).</li>
        </ul>
        <MockWindow title="Проекты (схема)">
          <RowSchematic />
        </MockWindow>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">2. Услуги (примеры к проектам)</h3>
        <p className="text-gray-600">
          К каждому направлению со страницы «Услуги» можно привязать конкретные проекты-образцы. Список пустой: на сайте подставляются проекты <strong className="text-gray-800">по полю «Категория»</strong> у проекта, как раньше.
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
            <strong className="text-gray-800">Новости</strong> - превью, дата, галерея, текст; переключатель публикации; порядок - перетаскивание. Блоки раскрываются плавно, как окно.
          </li>
          <li>
            <strong className="text-gray-800">Отзывы</strong> - при необходимости укажите связанный проект в списке (там же - только названия, без id).
          </li>
          <li>
            <strong className="text-gray-800">Партнёры</strong> - название, ссылка на сайт, показ в бегущей строке, порядок.
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
        <p className="text-gray-600">Только просмотр и очистка. Уведомления в Telegram и на почту настраиваются в <code className="text-xs bg-gray-100 rounded px-1">.env</code> API-сервера, см. «Настройки» в админке.</p>
      </section>

      <section className="space-y-3">
        <h3 className="font-semibold text-gray-900">5. Показатели</h3>
        <p className="text-gray-600">Три блока цифр на главной: значение и подпись. Суффиксы не используются - всё пишется в «Подпись».</p>
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
          Телефон (маска +7), email для отображения и для писем о заявках, адреса, режим, ссылки мессенджеров, Яндекс.Метрика. <strong className="text-gray-800">Секреты</strong> (токен Telegram, SMTP) задаются в переменных окружения на сервере, не в этой форме.
        </p>
        <p className="text-gray-600">
          <strong className="text-gray-800">2FA (двухфактор)</strong> - опционально: пароль, затем 6-знаков из приложения. Секрет хранится на сервере, в публичный API не отдаётся. Нужен работающий <code className="text-xs bg-gray-100 rounded px-1">/api</code> и, при настройке, <code className="text-xs bg-gray-100 rounded px-1">VITE_ADMIN_API_KEY</code>.
        </p>
      </section>

      <section className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-amber-900 text-xs leading-relaxed">
        <strong className="font-semibold">Скриншоты.</strong> Снимки экрана для инструкции сделайте вручную (Win+Shift+S) и при необходимости положите в{" "}
        <code className="rounded bg-amber-100/80 px-1">public/</code> - разработчик подключит.
      </section>
    </div>
  );
}
