import CreatePage from "./create";
const hubboundConfig = {
  sourceCreate: {
    name: "Create",
    component: (props) => <CreatePage {...props} dataType="hubbound" />,
  },
};

export default hubboundConfig;
