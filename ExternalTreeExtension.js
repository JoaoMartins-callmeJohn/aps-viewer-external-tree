class ExternalTreeExtension extends Autodesk.Viewing.Extension {
  constructor(viewer, options) {
    super(viewer, options);
    this._onObjectTreeCreated = (ev) => this.onModelLoaded(ev.model);
    this.treeContainer = "#tree";
    this.tree = null;
  }

  async load() {
    this.viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, this._onObjectTreeCreated);
    console.log('ExternalTreeExtension has been loaded.');
    return true;
  }

  async unload() {
    this.viewer.removeEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, this._onObjectTreeCreated);
    console.log('ExternalTreeExtension has been unloaded.');
    return true;
  }

  onModelLoaded(model) {
    model.getObjectTree(function (tree) {
      let ext = viewer.getExtension('ExternalTreeExtension');
      ext.tree = tree;
      ext.initTree();
    });
    
  }

  createTreeNode(id, text, children = false) {
    return { id:id, text:text, children:children};
  }

  async initTree(){
    const tree = new InspireTree({
      data: async (node) => {
        let ext = viewer.getExtension('ExternalTreeExtension');
        if (!node || !node.id) {
          let rootId = ext.tree.getRootId();
          let hasChild = ext.tree.getChildCount(rootId) > 0;
          let newNode = ext.createTreeNode(rootId, 'model', hasChild);
          return [newNode];         
        } else {
          ext.tree.enumNodeChildren(node.id, (childId) => {
            let nodeName = ext.tree.getNodeName(childId);
            let hasChild = ext.tree.getChildCount(childId) > 0;
            let newNode = ext.createTreeNode(childId, nodeName, hasChild);
            node.addChild(newNode);
          }, false);
        }
        return [];
      }
    });
    tree.on('node.click', function (event, node) {
        event.preventTreeDefault();
        viewer.isolate(node.id);
        viewer.fitToView(node.id);
    });
    let ext = viewer.getExtension('ExternalTreeExtension');
    return new InspireTreeDOM(tree, { target: ext.treeContainer });
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension('ExternalTreeExtension', ExternalTreeExtension);