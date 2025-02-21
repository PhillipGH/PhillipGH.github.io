
type TNode = {rank: number, id: number, parent?: TNode};
const makeSet = (id: number) : TNode => {
    const singleton : TNode = {
      rank: 0,
      id: id,
    };
    singleton.parent = singleton;
    return singleton;

  };
  
const find = (node: TNode): TNode => {
    if (node.parent !== node) {
      node.parent = find(node.parent as TNode);
    }
  
    return node.parent;
  };
  
const union = (node1: TNode, node2: TNode) => {
    const root1 = find(node1);
    const root2 = find(node2);
    if (root1 !== root2) {
      if (root1.rank < root2.rank) {
        root1.parent = root2;
      } else {
        root2.parent = root1;
        if (root1.rank === root2.rank) root1.rank += 1;
      }
    }
  };

  export const runUnion = (count: number, edges: [number, number][]): Set<number>[] => {
    const elements : TNode[] = [];
    for (let i=0; i < count; i++) {
        elements.push(makeSet(i));
    }
    edges.forEach((edge) => {
        union(elements[edge[0]], elements[edge[1]]);
    });
    const sets = new Map<number, Set<number>>();
    elements.forEach((element) => {
        const root = find(element);
        if (!sets.has(root.id)) {
            sets.set(root.id, new Set<number>());
        }
        sets.get(root.id)?.add(element.id);
    });
    return Array.from(sets.values());
  };

  export default class CoordinateSet {
    tree: Record<number, Record<number, boolean>> = {}
  
    add(x: number, y: number) {
      this.tree[x] ||= {}
      this.tree[x][y] = true;
    }
  
    has(x: number, y: number) {
      return !!this.tree[x]?.[y];
    }

    getRightmostTop() : {x: number, y: number} {
        const xValues = Object.keys(this.tree).map(Number);
        const x = Math.max(...xValues);
        const yValues = Object.keys(this.tree[x]).map(Number);
        const y = Math.min(...yValues);
        return {x, y};
    }
  }