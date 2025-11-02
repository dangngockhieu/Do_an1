import { useEffect, useState } from 'react';
import { FaPlus, FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io"; 
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
  const [search, setSearch] = useState(false);

  const [showModelCreateUser, setShowModelCreateUser] = useState(false);
  const [showModelUpdateUser, setShowModelUpdateUser] = useState(false);
  const [showModelViewUser, setShowModelViewUser] = useState(false);
  const [showModelDeleteUser, setShowModelDeleteUser] = useState(false);

  const [dataUpdate, setDataUpdate] = useState({});
  const [dataDelete, setDataDelete] = useState({});

  useEffect(() => {
    fetchAndNotify(currentPage, searchTerm);
  }, []); 

  const fetchAndNotify = async (page, keyword = "") => {
    try {
      const res = await getUserWithPaginate(page, LIMIT, keyword);
      console.log(res);
      if (res && res.EC === 0) {
        const users = res.DT?.users || [];
        setListUsers(users);
        setPageCount(Math.ceil((res.DT?.total || 0) / LIMIT));
        if (users.length === 0 && keyword && keyword.trim() !== '') {
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

  const fetchListUsersWithPaginate = fetchAndNotify;

  const resetSearchTerm = () => {
    setSearchTerm("");
  };

  const handleClearSearch = async () => {
    setCurrentPage(1); 
    setSearchTerm("");
    setSearch(false);
    await fetchAndNotify(1, "");
  };

  const handleChangeSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = async () => {
    setSearch(true);
    const keyword = searchTerm.trim();
    if (!keyword) {
      setCurrentPage(1);
      await fetchAndNotify(1, keyword);
      return;
    }

    try {
      const res = await findUserPage(keyword, LIMIT);
      if (res && res.EC === 0) {
        const page = res.DT?.page || 1;
        if (page && page > 0) {
          await fetchAndNotify(page, keyword);
          setCurrentPage(page);
          setPageCount(page)
        } else {
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
            <input
              type="text"
              placeholder="Nhập email để tìm kiếm ..."
              value={searchTerm}
              onChange={handleChangeSearch}
              onKeyDown={onKeyDown}
            />
            {search ? (
              // HIỂN THỊ NÚT X (CLEAR) KHI CÓ SEARCHTERM
              <button className="search-clear-btn" onClick={handleClearSearch} aria-label="clear search">
                <IoMdClose className="clear-icon" style={{color: 'red', fontSize: '1.2rem', fontWeight: "600"}} />
              </button>
            ) : (
              // HIỂN THỊ NÚT SEARCH KHI KHÔNG CÓ SEARCHTERM
              <button className="search-icon-btn" onClick={handleSearchSubmit} aria-label="search">
                <FaSearch className="search-icon" style={{color: '#636262ff'}} />
              </button>
            )}
          </div>
          <button
            className="btn-create"
            onClick={() => setShowModelCreateUser(true)}
            disabled={showModelCreateUser}
          >
            <FaPlus />  Tạo mới User
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
            resetSearchTerm={resetSearchTerm}
            limit={LIMIT}
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