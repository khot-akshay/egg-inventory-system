import * as React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {TreeItem, TreeView} from "@mui/lab";
import {Checkbox, FormControlLabel, Radio, RadioGroup} from "@mui/material";
export interface DataTreeNode {
    id: number;
    name: string;
    parent_id: number | null;
    children: DataTreeNode[];
    is_active?: boolean;
    display_order?: number;
    primary_photo?: string;
    display_name?: string;
    is_banner_category?: boolean;
  }
  
export default function DataTreeCheckbox(props:any){
  const [selected, setSelected] = React.useState<string[]>([]);
  //node is always the root "Parent"
  //id is id of node clicked
  React.useEffect(() => {
    setSelected(props.selectedCategories || []);
  }, [props.selectedCategories]);

  function getChildById(node: DataTreeNode, id: string) {
    let array: any[] = [];
  
    //returns an array of nodes ids: clicked node id and all children node ids
    function getAllChild(nodes: DataTreeNode | null) {
      if (nodes === null) return [];
      array.push(nodes.id);
      if (Array.isArray(nodes.children)) {
        nodes.children.forEach((node) => {
          array = [...array, ...getAllChild(node)];
          array = array.filter((v, i) => array.indexOf(v) === i);
        });
      }
      return array;
    }

    //returns the node object that was selected
    function getNodeById(nodes: DataTreeNode, id: string) {
      if (nodes.id === id) {
        return nodes;
      } else if (Array.isArray(nodes.children)) {
        let result = null;
        nodes.children.forEach((node) => {
          if (!!getNodeById(node, id)) {
            result = getNodeById(node, id);
          }
        });
        return result;
      }
      return null;
    }

    return getAllChild(getNodeById(node, id));
  }

  function getOnChange(checked: boolean, nodes: DataTreeNode) {
    //gets all freshly selected or unselected nodes
    const allNode: any[] = getChildById(nodes, nodes.id);
    //combines newly selected nodes with existing selection
    //or filters out newly deselected nodes from existing selection
    let array = checked
      ? [...selected, ...allNode]
      : selected.filter((value) => !allNode.includes(value));
      let parentId=nodes?.parent_id

      if(nodes?.parent_id){
        array.push(+nodes.parent_id)
      }
      // for (let eachObject of props.data) {
      //   if (nodes?.parent_id) {
      //     parentId = eachObject.id === +nodes.parent_id
      //   array.push()
      //     if (parentId) break; 
      //   }
      // }
    setSelected(array);
    props.onCategorySelect(array)
  }

  const CategoryNodeWithRadio = (nodes: DataTreeNode) => {
    // console.log(nodes)
    return (
      <TreeItem
        key={nodes.id}
        nodeId={nodes.id+""}
        label={
          <FormControlLabel


            control={
              <Checkbox
                checked={selected?.some((item:any) => item === nodes.id)}
                onChange={(e)=>{
                  console.log(nodes)
                  getOnChange(e.currentTarget.checked, nodes)
                  // console.log(props.data,nodes.id)
                  // const allNode: string[] = getChildById(props.data, nodes.id);
                  // console.log(allNode)
                  // //combines newly selected nodes with existing selection
                  // //or filters out newly deselected nodes from existing selection
                  // let checked= e.currentTarget.checked
                  // let array = checked
                  //   ? [...selected, ...allNode]
                  //   : selected.filter((value) => !allNode.includes(value));
                  // console.log(array)
                  // setSelected(array);
                  // props.onCategorySelect(array)
                }
                }
                //onClick={(e) => e.stopPropagation()}
              />
            }
            label={<>{nodes.display_name}</>}
            key={nodes.id}
          />
        }
      >
        {Array.isArray(nodes.children)
          ? nodes.children.map((node) => CategoryNodeWithRadio(node))
          : null}
      </TreeItem>
    );
  };

  return (
    <>

      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        {props.data.length>0? props.data.map((node:DataTreeNode) => CategoryNodeWithRadio(node)):null}
      </TreeView>

    </>
  );
}
