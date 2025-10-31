import { useEffect, useState } from 'react';
import { FcPlus } from 'react-icons/fc';
import { FaSearch } from "react-icons/fa";
import { toast } from 'react-toastify';
import TableUserPaginate from "./TableUserPaginate";
import ModelCreateUser from "./ModelCreateUser";
import ModelUpdateUser from "./ModelUpdateUser";
import ModelViewUser from "./ModelViewUser";
import ModelDeleteUser from "./ModelDeleteUser";
import { getUserWithPaginate, findUserPage } from '../../../services/apiServices';
import './ManageUser.scss';

const ManagerUser = () => {
  const LIMIT = 2;
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [listUsers, setListUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [showModelCreateUser, setShowModelCreateUser] = useState(false);
  const [showModelUpdateUser, setShowModelUpdateUser] = useState(false);
  const [showModelViewUser, setShowModelViewUser] = useState(false);
  const [showModelDeleteUser, setShowModelDeleteUser] = useState(false);

  const [dataUpdate, setDataUpdate] = useState({});
  const [dataDelete, setDataDelete] = useState({});

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchListUsersWithPaginate(1, searchTerm);
    }, 5);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const fetchAndNotify = async (page, keyword = "") => {
    try {
      const res = await getUserWithPaginate(page, LIMIT, keyword);
      if (res && res.EC === 0) {
        const users = res.DT?.users || [];
        setListUsers(users);
        setPageCount(Math.ceil((res.DT?.total || 0) / LIMIT));
        if (users.length === 0 && keyword && keyword.trim() !== '') {
          toast.error('Không tìm thấy người dùng');
        }
      } else {
        setListUsers([]);
        setPageCount(0);
        if (res && res.EM) toast.error(res.EM);
      }
    } catch (error) {
      console.error(error);
      setPageCount(0);
      toast.error('Lỗi khi tìm kiếm');
    }
  };

  // preserve original function name used by child components
  const fetchListUsersWithPaginate = fetchAndNotify;

  const handleChangeSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = async () => {
    const keyword = searchTerm.trim();
    if (!keyword) {
      setCurrentPage(1);
      await fetchAndNotify(1, keyword);
      return;
    }

    // Ask backend which page contains the matched user, then fetch that page
    try {
      const res = await findUserPage(keyword, LIMIT);
      // our axios instance unwraps response.data and returns it directly
      if (res && res.EC === 0) {
        const page = res.DT?.page || 1;
        if (page && page > 0) {
          setCurrentPage(page);
          await fetchAndNotify(page, keyword);
        } else {
          // not found
          setListUsers([]);
          setPageCount(0);
          toast.error('Không tìm thấy người dùng');
        }
      } else {
        toast.error(res?.EM || 'Lỗi khi tìm trang người dùng');
      }
    } catch (error) {
      console.error(error);
      toast.error('Lỗi khi tìm trang người dùng');
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.trim());
    setCurrentPage(1);
  };

  const handleClickBtnUpdate = (user) => {
    setShowModelUpdateUser(true);
    setDataUpdate(user);
  };

  const handleClickBtnView = (user) => {
    setShowModelViewUser(true);
    setDataUpdate(user);
  };

  const handleClickBtnDelete = (user) => {
    setShowModelDeleteUser(true);
    setDataDelete(user);
  };

  const resetUpdateData = () => {
    setDataUpdate({});
    setShowModelUpdateUser(false);
  };

  return (
    <div className="manage-user-container">
      <div className="header">
        <div className="title">Quản lý người dùng</div>
        <div className="actions">
          <div className="search-box">
            <button className="search-icon-btn" onClick={handleSearchSubmit} aria-label="search">
              <FaSearch className="search-icon" style={{color: '#636262ff'}} />
            </button>
            <input
              type="text"
              placeholder="Nhập email hoặc tên để tìm kiếm..."
              value={searchTerm}
              onChange={handleChangeSearch}
              onKeyDown={onKeyDown}
            />
          </div>
          <button
            className="btn-create"
            onClick={() => setShowModelCreateUser(true)}
            disabled={showModelCreateUser}
          >
            <FcPlus style={{ fontSize: '1.2rem' }} /> Tạo mới User
          </button>
        </div>
      </div>

      <div className="users-content">
        <div className="table-users-container fade-in">
          <TableUserPaginate
            listUsers={listUsers}
            handleClickBtnUpdate={handleClickBtnUpdate}
            handleClickBtnView={handleClickBtnView}
            handleClickBtnDelete={handleClickBtnDelete}
            fetchListUsersWithPaginate={fetchListUsersWithPaginate}
            pageCount={pageCount}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            searchTerm={searchTerm}
          />
        </div>

        <ModelCreateUser
          show={showModelCreateUser}
          setShow={setShowModelCreateUser}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          fetchListUsersWithPaginate={fetchListUsersWithPaginate}
        />

        <ModelUpdateUser
          show={showModelUpdateUser}
          setShow={setShowModelUpdateUser}
          dataUpdate={dataUpdate}
          fetchListUsersWithPaginate={fetchListUsersWithPaginate}
          currentPage={currentPage}
          resetUpdateData={resetUpdateData}
        />

        <ModelViewUser
          show={showModelViewUser}
          setShow={setShowModelViewUser}
          dataUpdate={dataUpdate}
        />

        <ModelDeleteUser
          show={showModelDeleteUser}
          setShow={setShowModelDeleteUser}
          dataDelete={dataDelete}
          fetchListUsersWithPaginate={fetchListUsersWithPaginate}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default ManagerUser;
