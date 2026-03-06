const StatusBadge = ({ status }) => {
    const config = {
        pending: { class: 'status-pending', label: 'Pending', icon: '⏳' },
        approved: { class: 'status-approved', label: 'Approved', icon: '✅' },
        rejected: { class: 'status-rejected', label: 'Rejected', icon: '❌' },
        changes_requested: { class: 'status-changes', label: 'Changes Requested', icon: '✏️' },
    };

    const { class: className, label, icon } = config[status] || config.pending;

    return (
        <span className={`status-badge ${className}`}>
            <span className="mr-1">{icon}</span>
            {label}
        </span>
    );
};

export default StatusBadge;
