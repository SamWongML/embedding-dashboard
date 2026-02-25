import type { LucideIcon } from "lucide-react";
import {
	Activity,
	BarChart3,
	Building2,
	Database,
	FileText,
	GitBranch,
	Image,
	Search,
	Users,
} from "lucide-react";

export type NavigationSection =
	| "Monitoring"
	| "Services"
	| "Data"
	| "Admin";

export interface NavigationItem {
	href: string;
	label: string;
	section: NavigationSection;
	keywords: readonly string[];
	icon: LucideIcon;
}

export const navigationItems: readonly NavigationItem[] = [
	{
		href: "/",
		label: "Metrics & Traces",
		section: "Monitoring",
		keywords: ["health", "monitoring", "status"],
		icon: Activity,
	},
	{
		href: "/metrics",
		label: "Usage Analytics",
		section: "Monitoring",
		keywords: ["analytics", "charts", "data"],
		icon: BarChart3,
	},
	{
		href: "/text-embedding",
		label: "Text Embedding",
		section: "Services",
		keywords: ["text", "embed", "vector"],
		icon: FileText,
	},
	{
		href: "/image-embedding",
		label: "Image Embedding",
		section: "Services",
		keywords: ["image", "vision", "picture"],
		icon: Image,
	},
	{
		href: "/search",
		label: "Hybrid Search",
		section: "Services",
		keywords: ["search", "query", "find"],
		icon: Search,
	},
	{
		href: "/records",
		label: "Records",
		section: "Data",
		keywords: ["data", "table", "list"],
		icon: Database,
	},
	{
		href: "/graph",
		label: "Graph",
		section: "Data",
		keywords: ["neo4j", "nodes", "relationships"],
		icon: GitBranch,
	},
	{
		href: "/admin/workspace",
		label: "Workspace",
		section: "Admin",
		keywords: ["workspace", "knowledge base", "access control", "admin"],
		icon: Building2,
	},
	{
		href: "/users",
		label: "Users",
		section: "Admin",
		keywords: ["admin", "permissions", "access"],
		icon: Users,
	},
];

export interface NavigationGroup {
	section: NavigationSection;
	items: NavigationItem[];
}

export function groupNavigationItems(
	items: readonly NavigationItem[],
): NavigationGroup[] {
	const groups = new Map<NavigationSection, NavigationItem[]>();

	for (const item of items) {
		const current = groups.get(item.section) ?? [];
		current.push(item);
		groups.set(item.section, current);
	}

	return Array.from(groups.entries()).map(([section, groupItems]) => ({
		section,
		items: groupItems,
	}));
}

export const navigationGroups = groupNavigationItems(navigationItems);
