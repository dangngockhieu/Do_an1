const StatCard = ({ title, value }) => (
  <div className="stat-card">
    <div className="stat-value">{value}</div>
    <div className="stat-title">{title}</div>
  </div>
);

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h2>Overview</h2>
      <div className="stat-grid">
        <StatCard title="Users" value="1,234" />
        <StatCard title="Orders" value="512" />
        <StatCard title="Revenue" value="$12,345" />
      </div>

      <section className="panel">
        <h3>Recent orders</h3>
        <p>Placeholder for a table or chart showing recent order activity.</p>
      </section>
    </div>
  );
};

export default AdminDashboard;
