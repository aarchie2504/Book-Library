/* eslint-disable react/jsx-pascal-case */
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import AnnouncementBanner from './AnnouncementBanner.jsx';
import { ToastProvider, ConfirmProvider } from './ToastProvider.jsx';
import NotFound from './NotFound.jsx';

// ── Route guards ───────────────────────────────────────────────────────────────
import Private_Component, { AdminRoute, WriterRoute, ReaderRoute } from './Private_Component.jsx';

// ── Public pages ──────────────────────────────────────────────────────────────
import Home from './Home.jsx';
import About from './About.jsx';
import Contact from './Contact.jsx';
import Login from './Login.jsx';
import Writer_Registration from './Writer_Registration.jsx';
import Reader_Registration from './Reader_Registration.jsx';
import Forgot_Password from './Forgot_Password.jsx';
import Change_Password from './Change_Password.jsx';
import Registration from './Registration.jsx';

// ── Shared logged-in pages (any role) ────────────────────────────────────────
import Reader_View_All_Books from './Reader_View_All_Books.jsx';
import Reader_View_Book_Detail from './Reader_View_Book_Detail.jsx';

// ── Admin pages ───────────────────────────────────────────────────────────────
import Admin_View_Category from './Admin_View_Category.jsx';
import Admin_Add_Category from './Admin_Add_Category.jsx';
import Admin_Update_Category from './Admin_Update_Category.jsx';
import Admin_View_Books from './Admin_View_Books.jsx';
import Admin_Add_Books from './Admin_Add_Books.jsx';
import Admin_Update_Books from './Admin_Update_Book.jsx';
import Admin_View_Books_Detail_Report from './Admin_View_Books_Detail_Report.jsx';
import Admin_View_Writer_Detail_Report from './Admin_View_Writer_Detail_Report.jsx';
import Admin_View_WriterWise_Book_Report from './Admin_View_WriterWise_Book_Report.jsx';
import Admin_View_Bookwise_Rating from './Admin_View_Bookwise_Rating.jsx';
import Admin_View_Reader_Detail_Report from './Admin_View_Reader_Detail_Report.jsx';
import Admin_View_ReaderWise_Rating_Report from './Admin_View_ReaderWise_Rating_Report.jsx';
import Admin_Dashboard from './Admin_Dashboard.jsx';
import Admin_Manage_Readers from './Admin_Manage_Readers.jsx';
import Admin_Manage_Writers from './Admin_Manage_Writers.jsx';
import Admin_Moderate_Ratings from './Admin_Moderate_Ratings.jsx';
import Admin_Site_Search from './Admin_Site_Search.jsx';
import Admin_Featured_Books from './Admin_Featured_Books.jsx';
import Admin_Announcement from './Admin_Announcement.jsx';
import Admin_Export_Reports from './Admin_Export_Reports.jsx';
import Admin_Borrow_Management from './Admin_Borrow_Management.jsx';

// ── Writer pages ──────────────────────────────────────────────────────────────
import Writer_View_Uploaded_Books from './Writer_View_Uploaded_Books.jsx';
import Writer_Add_Books from './Writer_Add_Books.jsx';
import Writer_View_All_Books from './Writer_View_All_Books.jsx';
import Writer_Update_Book from './Writer_Update_Book.jsx';
import Writer_View_BookWise_Rating from './Writer_View_BookWise_Rating.jsx';
import Writer_Profile from './Writer_Profile.jsx';
import Writer_Analytics from './Writer_Analytics.jsx';
import Writer_Book_Reviews from './Writer_Book_Reviews.jsx';
import Writer_Notifications from './Writer_Notifications.jsx';

// ── Reader pages ──────────────────────────────────────────────────────────────
import Reader_Profile from './Reader_Profile.jsx';
import Reader_Bookmarks from './Reader_Bookmarks.jsx';
import Reader_Recommendations from './Reader_Recommendations.jsx';
import Reader_Reading_History from './Reader_Reading_History.jsx';
import Reader_Following from './Reader_Following.jsx';

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-parchment-100">
          <AnnouncementBanner />
          <Navbar />
          <main className="flex-1">
            <Routes>

              {/* ── Fully public routes ── */}
              <Route path='/'                       element={<Home />}/>
              <Route path='/about'                  element={<About />}/>
              <Route path='/contact'                element={<Contact />}/>
              <Route path='/login'                  element={<Login />}/>
              <Route path='/writer_registration'    element={<Writer_Registration />}/>
              <Route path='/reader_registration'    element={<Reader_Registration />}/>
              <Route path='/register'               element={<Registration />}/>
              <Route path='/forgot_password'        element={<Forgot_Password />}/>

              {/* ── Browse books: accessible to all logged-in users ── */}
              <Route element={<Private_Component />}>
                <Route path='/reader_view_all_books'        element={<Reader_View_All_Books />}/>
                <Route path='/reader_view_book_detail/:bid' element={<Reader_View_Book_Detail />}/>
                <Route path='/change_password'              element={<Change_Password />}/>
              </Route>

              {/* ── Admin only routes ── */}
              <Route element={<AdminRoute />}>
                <Route path='/admin_dashboard'                          element={<Admin_Dashboard />}/>
                <Route path='/admin_view_category'                      element={<Admin_View_Category />}/>
                <Route path='/admin_add_category'                       element={<Admin_Add_Category />}/>
                <Route path='/admin_update_category/:cid'               element={<Admin_Update_Category />}/>
                <Route path='/admin_view_books'                         element={<Admin_View_Books />}/>
                <Route path='/admin_add_books'                          element={<Admin_Add_Books />}/>
                <Route path='/admin_update_book/:bid'                   element={<Admin_Update_Books />}/>
                <Route path='/admin_view_books_detail_report'           element={<Admin_View_Books_Detail_Report />}/>
                <Route path='/admin_view_writer_detail_report'          element={<Admin_View_Writer_Detail_Report />}/>
                <Route path='/admin_view_writerwise_books_report/:wid'  element={<Admin_View_WriterWise_Book_Report />}/>
                <Route path='/admin_view_bookwise_rating/:bid'          element={<Admin_View_Bookwise_Rating />}/>
                <Route path='/admin_view_reader_detail_report'          element={<Admin_View_Reader_Detail_Report />}/>
                <Route path='/admin_view_readerwise_rating_report/:rid' element={<Admin_View_ReaderWise_Rating_Report />}/>
                <Route path='/admin_manage_readers'                     element={<Admin_Manage_Readers />}/>
                <Route path='/admin_manage_writers'                     element={<Admin_Manage_Writers />}/>
                <Route path='/admin_moderate_ratings/:bid'              element={<Admin_Moderate_Ratings />}/>
                <Route path='/admin_site_search'                        element={<Admin_Site_Search />}/>
                <Route path='/admin_featured_books'                     element={<Admin_Featured_Books />}/>
                <Route path='/admin_announcement'                       element={<Admin_Announcement />}/>
                <Route path='/admin_export_reports'                     element={<Admin_Export_Reports />}/>
                <Route path='/admin_borrow_management'                  element={<Admin_Borrow_Management />}/>
              </Route>

              {/* ── Writer only routes ── */}
              <Route element={<WriterRoute />}>
                <Route path='/writer_view_uploaded_books'       element={<Writer_View_Uploaded_Books />}/>
                <Route path='/writer_add_books'                 element={<Writer_Add_Books />}/>
                <Route path='/writer_view_all_books'            element={<Writer_View_All_Books />}/>
                <Route path='/writer_update_book/:bid'          element={<Writer_Update_Book />}/>
                <Route path='/writer_view_bookwise_rating/:bid' element={<Writer_View_BookWise_Rating />}/>
                <Route path='/writer_profile'                   element={<Writer_Profile />}/>
                <Route path='/writer_analytics'                 element={<Writer_Analytics />}/>
                <Route path='/writer_book_reviews/:bid'         element={<Writer_Book_Reviews />}/>
                <Route path='/writer_notifications'             element={<Writer_Notifications />}/>
              </Route>

              {/* ── Reader only routes ── */}
              <Route element={<ReaderRoute />}>
                <Route path='/reader_profile'           element={<Reader_Profile />}/>
                <Route path='/reader_bookmarks'         element={<Reader_Bookmarks />}/>
                <Route path='/reader_recommendations'   element={<Reader_Recommendations />}/>
                <Route path='/reader_reading_history'   element={<Reader_Reading_History />}/>
                <Route path='/reader_following'         element={<Reader_Following />}/>
              </Route>

              {/* ── 404 catch-all ── */}
              <Route path='*' element={<NotFound />}/>

            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
      </ConfirmProvider>
    </ToastProvider>
  );
}
export default App;