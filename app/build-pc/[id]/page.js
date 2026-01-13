import BuildPCPage from "@/features/build-pc/BuildPCPage";

export const metadata = {
  title: "Chỉnh sửa cấu hình - PC Adviser",
  description: "Chỉnh sửa cấu hình máy tính của bạn",
};

export default function BuildPCConfigPage({ params }) {
  return <BuildPCPage configId={params.id} />;
}

