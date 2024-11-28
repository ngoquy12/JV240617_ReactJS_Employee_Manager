import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Pagination,
  Select,
  Table,
  message,
} from "antd";
import { useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoCloseSharp } from "react-icons/io5";
import moment from "moment";

export default function EmployeeManager() {
  const [isShowForm, setIsShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();

  const [employees, setEmployees] = useState(() => {
    const storedEmployees = JSON.parse(localStorage.getItem("employees")) || [];
    return storedEmployees.map((emp) => ({
      ...emp,
      dateOfBirth: emp.dateOfBirth
        ? moment(emp.dateOfBirth, "YYYY-MM-DD")
        : null,
    }));
  });

  const saveToLocalStorage = (data) => {
    localStorage.setItem("employees", JSON.stringify(data));
  };

  const handleSubmit = (values) => {
    console.log("Values: ", values);

    const formattedValues = {
      ...values,
      dateOfBirth: values.dateOfBirth.format("YYYY-MM-DD"), // Chuyển đổi sang chuỗi
    };

    if (editingEmployee) {
      const updatedEmployees = employees.map((emp) =>
        emp.id === editingEmployee.id
          ? { ...editingEmployee, ...formattedValues }
          : emp
      );
      setEmployees(updatedEmployees);
      saveToLocalStorage(updatedEmployees);
      message.success("Cập nhật nhân viên thành công!");
    } else {
      const newEmployee = {
        id: Date.now(),
        status: "active",
        ...formattedValues,
      };
      const updatedEmployees = [...employees, newEmployee];
      setEmployees(updatedEmployees);
      saveToLocalStorage(updatedEmployees);
      message.success("Thêm nhân viên thành công!");
    }

    setIsShowForm(false);
    form.resetFields();
    setEditingEmployee(null);
  };

  const handleDelete = (id) => {
    const updatedEmployees = employees.filter((emp) => emp.id !== id);
    setEmployees(updatedEmployees);
    saveToLocalStorage(updatedEmployees);
    message.success("Xóa nhân viên thành công!");
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    form.setFieldsValue(employee);
    setIsShowForm(true);
  };

  const handleStatusChange = (id, status) => {
    const updatedEmployees = employees.map((emp) =>
      emp.id === id ? { ...emp, status } : emp
    );
    setEmployees(updatedEmployees);
    saveToLocalStorage(updatedEmployees);
    message.success("Cập nhật trạng thái thành công!");
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Họ và tên",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (_, record) => (
        <Select
          className="w-[200px]"
          value={record.status}
          onChange={(value) => handleStatusChange(record.id, value)}
          options={[
            { value: "active", label: "Đang hoạt động" },
            { value: "inactive", label: "Ngừng hoạt động" },
          ]}
        />
      ),
    },
    {
      title: "Chức năng",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type="link" onClick={() => handleEdit(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  // Tìm kiếm và lọc
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.userName
      .toLowerCase()
      .includes(searchValue.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || employee.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Phân trang
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <>
      {/* Modal chứa Form thêm mới / Cập nhật nhân viên */}
      <Modal
        title={
          <div className="flex items-center justify-between">
            <h3 className="text-[20px]">
              {editingEmployee ? "Cập nhật nhân viên" : "Thêm mới nhân viên"}
            </h3>
            <IoCloseSharp
              onClick={() => {
                setIsShowForm(false);
                form.resetFields();
                setEditingEmployee(null);
              }}
              size={24}
              className="cursor-pointer hover:text-gray-700 transition-all"
            />
          </div>
        }
        closeIcon={false}
        footer={false}
        open={isShowForm}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            remember: true,
          }}
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label={<span className="font-semibold">Họ và tên</span>}
            name="userName"
            rules={[
              {
                required: true,
                message: "Họ và tên không được để trống",
              },
            ]}
          >
            <Input className="h-9" />
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold">Ngày sinh</span>}
            name="dateOfBirth"
            rules={[
              {
                required: true,
                message: "Ngày sinh không được để trống",
              },
            ]}
          >
            <DatePicker placeholder="Chọn ngày sinh" className="h-9 w-full" />
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold">Email</span>}
            name="email"
            rules={[
              {
                required: true,
                message: "Email không được để trống",
              },
              {
                type: "email",
                message: "Email không đúng định dạng",
              },
            ]}
          >
            <Input className="h-9" />
          </Form.Item>

          <Form.Item
            label={<span className="font-semibold">Địa chỉ</span>}
            name="address"
          >
            <Input className="h-9" />
          </Form.Item>

          <Form.Item label={null} className="mb-0">
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={() => {
                  setIsShowForm(false);
                  form.resetFields();
                  setEditingEmployee(null);
                }}
                type="default"
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingEmployee ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <main className="container mx-auto mt-12">
        <div className="mx-[120px] flex items-center justify-between">
          <h3 className="font-semibold text-[24px]">Quản lý nhân viên</h3>
          <Button
            onClick={() => {
              setIsShowForm(true);
              form.resetFields();
            }}
            type="primary"
            className="h-9"
          >
            Thêm mới nhân viên
          </Button>
        </div>

        <div className="mx-[120px] mt-4 flex justify-end items-center gap-4">
          <Select
            value={filterStatus}
            onChange={(value) => setFilterStatus(value)}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "active", label: "Đang hoạt động" },
              { value: "inactive", label: "Ngừng hoạt động" },
            ]}
            className="w-[200px] h-9"
          />
          <div className="relative flex items-center">
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-[40px] w-[300px] h-9"
              placeholder="Tìm kiếm theo tên"
            />
            <CiSearch size={20} className="absolute left-3" />
          </div>
        </div>

        <div className="mt-4 mx-[120px]">
          <Table
            dataSource={paginatedEmployees}
            rowKey="id"
            columns={columns}
            pagination={false}
            locale={{
              emptyText: "Không tìm thấy nhân viên",
            }}
          />
        </div>

        <div className="mt-4 flex justify-end mx-[120px]">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredEmployees.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            showTotal={(total, range) =>
              `${range[0]} - ${range[1]} trong ${total} nhân viên`
            }
            locale={{
              items_per_page: " nhân viên / trang",
            }}
          />
        </div>
      </main>
    </>
  );
}
