// A class that represents a symbol replacement rule to
// be used when expanding an L-system grammar.
class Rule {
	probability: number; // The probability that this Rule will be used when replacing a character in the grammar string
	successorString: string; // The string that will replace the char that maps to this Rule
    
    // :3c
    constructor(prob: number, succ: string) {
        this.probability = prob;
        this.successorString = succ;
    }
}


export class Node {
    sym: string;
    prev: Node;
    next: Node;

    constructor(prev: Node, next: Node, sym: string) {
        this.prev = prev;
        this.next = next;
        this.sym = sym;
    }
}

export class LinkedList {
    head: Node;
    tail: Node;

    constructor(head: Node, tail: Node) {
        this.head = head;
        this.tail = tail;
    }
}

// Given the node to be replaced, 
// insert a sub-linked-list that represents replacementString
function replaceNode(linkedList: LinkedList, node: Node, replacementString: string) {
    // New string as a linked list
    var subLinkedList = stringToLinkedList(replacementString);

    // Singleton
    if(linkedList.head == linkedList.tail) {
        linkedList.head = subLinkedList.head;
    }
    else {
        var curr = linkedList.head;
        // while not linked list still has entries
        while(curr) {
            // if curr is the node to be replaced 
            if(curr == node) {
                if(curr != linkedList.head) {
                    // prev now points to new linked list
                    curr.prev.next = subLinkedList.head;
                }
                // link new linked list to point back to curr's prev
                subLinkedList.head.prev = curr.prev;
                // if curr's next exists, link it to new linked list
                if(curr.next) {
                    subLinkedList.tail.next = curr.next;
                }
            }
            // move onto next element
            curr = curr.next;
        }
    }
}

// Turn the string into linked list 
export function stringToLinkedList(input_string: string) {
	// ex. assuming input_string = "F+X"
	// you should return a linked list where the head is 
    // at Node('F') and the tail is at Node('X')

    let head: Node = new Node(null, null, input_string.charAt(0));
    let prev: Node = head;
    let tail: Node = head;
    for(var i = 1; i < input_string.length; ++i) {
        let newNode: Node = new Node(prev, null, input_string.charAt(i));
        tail = newNode;
        prev.next = newNode;
        prev = newNode;
    }
	let ll: LinkedList = new LinkedList(head, tail);
	return ll;
}

// Return a string form of the LinkedList
export function linkedListToString(linkedList: LinkedList) {
	// ex. Node1("F")->Node2("X") should be "FX"
    var result = "";
    var curr = linkedList.head;
    while(curr) {
        result += curr.sym;
        curr = curr.next;
    }
	return result;
}

export class Lsystem {
    // default LSystem
    axiom: string;
    iterations: number;
    grammar: Map<string, Rule>; //any??

    constructor(axiom: string, iterations: number) {
;
        this.axiom = axiom;
        this.iterations = iterations;
        this.grammar = new Map<string, Rule>();
        this.grammar.set('X', new Rule(1.0, 'FFF[+FXF>F+F]FX[-FFX-FX<]X[+F>XFFF+]X>XF'));
        this.grammar.set('F', new Rule(1.0, 'FF'));
    }

	// This function returns a linked list that is the result 
	// of expanding the L-system's axiom n times.
	// The implementation we have provided you just returns a linked
	// list of the axiom.
	doIterations() {	
        let orig: string = this.axiom;
        // Output linked list
        let lSystemLL : LinkedList;

        // If no iterations, just return axiom
        if(this.iterations == 0) {
            lSystemLL = stringToLinkedList(this.axiom);
        }
        else {
            // Directly edit linked list from axiom
            lSystemLL = stringToLinkedList(orig);

            // Expand string per number of iterations
            for(let i: number = 0; i < this.iterations; ++i) {
                let curr: Node = lSystemLL.head;

                // while the linked list has entries
                while(curr) {
                    // original next node of curr
                    let next: Node = curr.next;
                    // If the current node is in the grammar (can be replaced)
                    if(this.grammar.get(curr.sym)) {
                        // Access the replacement string for this character
                        let replacement: string = this.grammar.get(curr.sym).successorString;
                        // Replace the node in the linked list
                        replaceNode(lSystemLL, curr, replacement);

                        // move onto the next unedited character
                        curr = next;
                    }
                    else {
                        // move onto the next character
                        curr = next;
                    }
                }
            }
        }

		return lSystemLL;
	}
}