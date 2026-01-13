import { Drawer, Menu } from "antd";

export default function HeaderMobileDrawer({
  open,
  onClose,
  menuItems,
}) {
  return (
    <Drawer
      title="Menu"
      placement="right"
      onClose={onClose}
      open={open}
      width={280}
    >
      <Menu
        mode="inline"
        items={menuItems}
        onClick={onClose}
      />
    </Drawer>
  );
}


